import "jsr:@std/dotenv/load";

type TSwiggyDiscountShare = {
  swiggyDiscount: number;
  restaurantDiscount: number;
};

type TSwiggyDeliveryFeeCouponBreakup = {
  thresholdFee: number;
  distanceFee: number;
  timeFee: number;
  specialFee: number;
  totalDeliveryFeeDiscount: number;
  discountShare: TSwiggyDiscountShare;
};

type TSwiggyDeliveryAddress = {
  id: string;
  version: number;
  name: string;
  address_line1: string;
  address_line2: string;
  address: string;
  landmark: string;
  area: string;
  mobile: string;
  alternate_mobile: string;
  annotation: string;
  instructions: string;
  voice_directions_s3_uri: string;
  email: string;
  flat_no: string;
  city: string;
  lat: string;
  lng: string;
  is_verified: boolean;
  reverse_geo_code_failed: boolean;
};

type TSwiggyAddonTaxCharges = {
  GST: string;
};

type TSwiggyAddon = {
  choice_id: string;
  group_id: string;
  name: string;
  price: number;
  external_choice_id: string;
  external_group_id: string;
  addon_tax_charges: TSwiggyAddonTaxCharges;
};

type TSwiggyCategoryDetails = {
  category: string;
  sub_category: string;
};

type TSwiggyItemCharges = {
  Vat: string;
  "Service Charges": string;
  "Service Tax": string;
  GST: string;
};

type TSwiggyAttributes = {
  portionSize: string;
  spiceLevel: any;
  vegClassifier: string;
  accompaniments: any;
};

type TSwiggyOrderItem = {
  item_key: string;
  has_variantv2: boolean;
  item_group_tag_id: string;
  added_by_user_id: number;
  added_by_username: string;
  item_id: string;
  external_item_id: string;
  name: string;
  is_veg: string;
  variants: any[];
  addons: TSwiggyAddon[];
  image_id: string;
  quantity: string;
  free_item_quantity: string;
  total: string;
  subtotal: string;
  final_price: string;
  base_price: string;
  effective_item_price: string;
  packing_charges: string;
  category_details: TSwiggyCategoryDetails;
  item_charges: TSwiggyItemCharges;
  item_total_discount: number;
  item_delivery_fee_reversal: number;
  meal_quantity: string;
  single_variant: boolean;
  attributes: TSwiggyAttributes;
  in_stock: number;
};

type TSwiggyOrder = {
  sharedOrder: boolean;
  primaryPaymentTransactionAmount: number;
  previousOrderId: number;
  deliveryFeeCouponBreakup: TSwiggyDeliveryFeeCouponBreakup;
  order_id: number;
  delivery_address: TSwiggyDeliveryAddress;
  order_items: TSwiggyOrderItem[];
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
};

type TSwiggyOrders = {
  csrfToken: string;
  data: {
    customer_care_number: number;
    total_orders: number;
    orders: TSwiggyOrder[];
  };
};

type TOrder = {
  id: number;
  restaurantName: string;
  totalPaid: number;
  items: string[];
};

Deno.serve({ port: 3000 }, async (_req) => {
  const API_URL = "https://www.swiggy.com/dapi/order/all";

  // TODO : remove this once login is implemented
  const SESSION_ID = Deno.env.get("SESSION_ID");
  const cookie = `_session_tid=${SESSION_ID}`;

  const headers = new Headers();
  headers.set("cookie", cookie);

  const swiggyOrders = await fetch(API_URL, { headers });
  const data = await swiggyOrders.json() as TSwiggyOrders;

  const formattedOrders = data.data.orders.reduce<Array<TOrder>>(
    (
      acc,
      order,
    ) => {
      acc.push({
        id: order.order_id,
        restaurantName: order.restaurant_name,
        totalPaid: order.primaryPaymentTransactionAmount,
        items: order.order_items.map((items) => items.name),
      });

      return acc;
    },
    [],
  );

  const response = {
    message: "Fetched data from Swiggy",
    orders_in_view: formattedOrders.length,
    formattedOrders,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
});
