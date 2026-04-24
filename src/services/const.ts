
import { type CategoryItem } from "@/types/user";
 const categoryOptions: CategoryItem[] = [
  {
    value: "flower",
    label: "鲜花绿植",
    children: [
      { value: "flower_shop", label: "鲜花店" },
      { value: "plant_shop", label: "绿植/园艺店" },
      { value: "flower_plant_mix", label: "综合鲜花绿植店" },
    ],
  },
  {
    value: "clothes",
    label: "服饰鞋帽",
    children: [
      { value: "bag_accessory", label: "箱包/配饰店" },
      { value: "underwear_home", label: "内衣/家居服店" },
      { value: "shoe_men_women", label: "男女鞋店" },
      { value: "clothes_mix", label: "综合服饰鞋帽店" },
      { value: "women_clothes", label: "女装店" },
      { value: "men_clothes", label: "男装店" },
      { value: "sport_shoe_clothes", label: "运动鞋/服店" },
      { value: "outdoor_sport", label: "户外/体育用品店" },
    ],
  },
  {
    value: "beauty",
    label: "美妆日化",
    children: [
      { value: "beauty_mix", label: "综合美妆日化专营店" },
      { value: "beauty_brand", label: "美妆品牌专卖店" },
    ],
  },
  {
    value: "baby_toy",
    label: "母婴玩具",
    children: [
      { value: "baby_clothes", label: "婴童服饰鞋帽店" },
      { value: "toy_model", label: "玩具/潮玩/模型店" },
      { value: "baby_mix", label: "综合母婴店" },
    ],
  },
  {
    value: "fruit",
    label: "水果类",
    children: [
      { value: "whole_fruit", label: "整果店" },
      { value: "cut_fruit", label: "果切店" },
      { value: "fruit_pulp", label: "果捞店" },
    ],
  },
  {
    value: "food_material",
    label: "食材",
    children: [
      { value: "fresh_supermarket", label: "综合生鲜果蔬超市" },
      { value: "market", label: "菜市场" },
      { value: "front", label: "前置仓" },
      { value: "hotpot", label: "火锅专营店" },
      { value: "seafood", label: "海鲜/水产店" },
      { value: "meat_poultry", label: "肉禽店" },
      { value: "bbq_shop", label: "烧烤专营店" },
      { value: "pre_food", label: "预制菜专营店" },
    ],
  },
  {
    value: "pet",
    label: "宠物类",
    children: [{ value: "pet_food_goods", label: "宠物食品/用品店" }],
  },
  {
    value: "supermarket",
    label: "超市便利",
    children: [
      { value: "big_supermarket", label: "大型超市/卖场" },
      { value: "mini_shop", label: "小型超市便利店" },
    ],
  },
  {
    value: "daily_goods",
    label: "日用百货",
    children: [
      { value: "daily_mix", label: "综合日用百货店" },
      { value: "book_store", label: "书店" },
      { value: "hardware_light", label: "五金/建材/灯具店" },
      { value: "stationery", label: "文具/文创/办公用品店" },
      { value: "tableware_kitchen", label: "餐具厨具店" },
      { value: "home_textile", label: "家居/家具/家纺店" },
      { value: "festival_gift", label: "节庆用品/礼品店" },
      { value: "jewelry", label: "珠宝首饰店" },
    ],
  },
  {
    value: "drink_wine",
    label: "酒水茶饮",
    children: [
      { value: "wine_shop", label: "酒水店" },
      { value: "water_station", label: "水站" },
      { value: "milk_station", label: "奶站" },
      { value: "tea_shop", label: "茶行" },
    ],
  },
  {
    value: "snack",
    label: "休闲食品",
    children: [
      { value: "snack_shop", label: "零食店" },
      { value: "nut_fried", label: "干果炒货店" },
      { value: "ice_shop", label: "冰品店" },
      { value: "local_special", label: "地方特产店" },
      { value: "grain_seasoning", label: "粮油调味店" },
      { value: "bulk_snack", label: "量贩零食店" },
      { value: "discount_shop", label: "折扣超市" },
    ],
  },
  {
    value: "digital",
    label: "数码家电",
    children: [
      { value: "phone_brand", label: "手机通讯品牌店" },
      { value: "computer_digital", label: "电脑数码品牌店" },
      { value: "home_appliance", label: "家用电器品牌店" },
      { value: "3c_mix", label: "3C电器综合店" },
      { value: "operator_shop", label: "运营商店" },
    ],
  },
  {
    value: "mall",
    label: "大型百货商场",
  },
];
export default categoryOptions;
