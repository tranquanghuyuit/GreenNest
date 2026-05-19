export type Category = {
  name: string;
  icon: string;
  count: number;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  priceValue: number;
  oldPrice?: string;
  badge: string;
  accent: string;
  unit: string;
  stockQuantity: number;
  description: string;
};

export const categories: Category[] = [
  { name: "Rau xanh", icon: "leaf", count: 24 },
  { name: "Trái cây", icon: "berry", count: 18 },
  { name: "Đồ uống", icon: "juice", count: 15 },
  { name: "Sữa & trứng", icon: "milk", count: 12 },
  { name: "Ngũ cốc", icon: "grain", count: 20 },
  { name: "Đồ ăn nhẹ", icon: "snack", count: 16 },
  { name: "Thực phẩm hữu cơ", icon: "organic", count: 10 }
];

export const products: Product[] = [
  {
    id: "prod-oat-honey",
    name: "Hạt yến mạch mật ong",
    brand: "Green Farm",
    category: "Ngũ cốc",
    price: "84.000đ",
    priceValue: 84000,
    oldPrice: "99.000đ",
    badge: "Hot",
    accent: "#f5b944",
    unit: "hộp 500g",
    stockQuantity: 42,
    description: "Yến mạch cán dẹt trộn mật ong rừng, phù hợp cho bữa sáng nhanh và lành mạnh."
  },
  {
    id: "prod-potato-bbq",
    name: "Snack khoai tây vị BBQ",
    brand: "Daily Snack",
    category: "Đồ ăn nhẹ",
    price: "32.000đ",
    priceValue: 32000,
    oldPrice: "39.000đ",
    badge: "Sale",
    accent: "#e85d3f",
    unit: "gói 120g",
    stockQuantity: 80,
    description: "Snack khoai tây lát mỏng vị BBQ, giòn nhẹ, dùng cho bữa phụ hoặc tiệc nhỏ."
  },
  {
    id: "prod-veggie-juice",
    name: "Nước ép rau củ mix",
    brand: "Freshy",
    category: "Đồ uống",
    price: "46.000đ",
    priceValue: 46000,
    badge: "Mới",
    accent: "#3bb77e",
    unit: "chai 300ml",
    stockQuantity: 36,
    description: "Nước ép phối rau củ, vị nhẹ, không thêm đường tinh luyện."
  },
  {
    id: "prod-roasted-coffee",
    name: "Cà phê hạt rang mộc",
    brand: "Bean House",
    category: "Đồ uống",
    price: "125.000đ",
    priceValue: 125000,
    oldPrice: "142.000đ",
    badge: "12%",
    accent: "#9b6b43",
    unit: "túi 250g",
    stockQuantity: 24,
    description: "Cà phê hạt rang mộc, hương chocolate nhẹ, phù hợp pha máy hoặc phin."
  },
  {
    id: "prod-peanut-butter",
    name: "Bơ đậu phộng nguyên chất",
    brand: "Nutri Food",
    category: "Hữu cơ",
    price: "68.000đ",
    priceValue: 68000,
    badge: "Top",
    accent: "#d8902f",
    unit: "hũ 220g",
    stockQuantity: 33,
    description: "Bơ đậu phộng xay mịn, không chất bảo quản, dùng với bánh mì hoặc smoothie."
  },
  {
    id: "prod-veggie-noodle",
    name: "Mì rau củ ít dầu",
    brand: "Healthy Bowl",
    category: "Đồ ăn nhanh",
    price: "27.000đ",
    priceValue: 27000,
    oldPrice: "35.000đ",
    badge: "Giảm",
    accent: "#71b66b",
    unit: "gói 90g",
    stockQuantity: 96,
    description: "Mì rau củ sấy, ít dầu hơn mì chiên truyền thống, tiện cho bữa nhanh."
  },
  {
    id: "prod-oat-muffin",
    name: "Bánh muffin yến mạch",
    brand: "Bakery Lab",
    category: "Bánh",
    price: "55.000đ",
    priceValue: 55000,
    badge: "Mới",
    accent: "#c47f53",
    unit: "hộp 4 cái",
    stockQuantity: 28,
    description: "Muffin yến mạch mềm, vị ngọt vừa, dùng cho bữa sáng hoặc trà chiều."
  },
  {
    id: "prod-brown-rice",
    name: "Gạo lứt hữu cơ",
    brand: "Rice Field",
    category: "Ngũ cốc",
    price: "96.000đ",
    priceValue: 96000,
    oldPrice: "118.000đ",
    badge: "18%",
    accent: "#b89650",
    unit: "túi 1kg",
    stockQuantity: 58,
    description: "Gạo lứt hữu cơ canh tác theo mùa, hạt chắc, dùng cho bữa ăn healthy."
  }
];

export const deals = [
  {
    title: "Combo rau xanh mỗi ngày",
    text: "Tươi trong ngày, giao nhanh trong 2 giờ",
    accent: "#dff6e8"
  },
  {
    title: "Bữa sáng healthy",
    text: "Ngũ cốc, sữa hạt và trái cây chọn lọc",
    accent: "#fff3d8"
  }
];
