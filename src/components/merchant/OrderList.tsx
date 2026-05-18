import React, { useState } from "react";
import {
  Table,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
  Button,
  Modal,
  Space,
  Tag,
  Upload,
  message,
  Typography,
  Progress,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  WarningOutlined,
  UploadOutlined,
  EyeOutlined,
  FormOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

// 你提供的商品死数据 直接复用
export interface ProductSku {
  id: string;
  specAttr: string;
  price: number;
  stockNum: number;
  warnStock: number;
}
export interface ProductSpu {
  id: string;
  spuName: string;
  mainImage: string;
  status: 0 | 1;
  auditStatus: 0 | 1 | 2;
  createTime: string;
  skuList: ProductSku[];
}
const MOCK_SPU_LIST: ProductSpu[] = [
  {
    id: "spu_001",
    spuName: "FOXUP粉底液30ml",
    mainImage: "https://picsum.photos/50/50?random=1",
    status: 1,
    auditStatus: 1,
    createTime: "2026-04-01",
    skuList: [
      {
        id: "sku_001",
        specAttr: "色号01粉瓷白",
        price: 129,
        stockNum: 88,
        warnStock: 10,
      },
      {
        id: "sku_002",
        specAttr: "色号02象牙白",
        price: 129,
        stockNum: 66,
        warnStock: 10,
      },
      {
        id: "sku_003",
        specAttr: "色号03自然色",
        price: 129,
        stockNum: 5,
        warnStock: 10,
      },
      {
        id: "sku_004",
        specAttr: "色号04小麦色",
        price: 129,
        stockNum: 30,
        warnStock: 10,
      },
    ],
  },
  {
    id: "spu_002",
    spuName: "橘朵高光修容盘10g",
    mainImage: "https://picsum.photos/50/50?random=2",
    status: 1,
    auditStatus: 1,
    createTime: "2026-04-02",
    skuList: [
      {
        id: "sku_005",
        specAttr: "01高光盘",
        price: 59,
        stockNum: 99,
        warnStock: 15,
      },
      {
        id: "sku_006",
        specAttr: "02修容盘",
        price: 59,
        stockNum: 80,
        warnStock: 15,
      },
    ],
  },
  {
    id: "spu_003",
    spuName: "YSL纯口红4g",
    mainImage: "https://picsum.photos/50/50?random=3",
    status: 1,
    auditStatus: 1,
    createTime: "2026-04-03",
    skuList: [
      {
        id: "sku_007",
        specAttr: "1966暖棕红",
        price: 380,
        stockNum: 40,
        warnStock: 8,
      },
      {
        id: "sku_008",
        specAttr: "21复古正红",
        price: 380,
        stockNum: 25,
        warnStock: 8,
      },
    ],
  },
  {
    id: "spu_004",
    spuName: "完美日记散粉8g",
    mainImage: "https://picsum.photos/50/50?random=4",
    status: 1,
    auditStatus: 1,
    createTime: "2026-04-04",
    skuList: [
      {
        id: "sku_009",
        specAttr: "透明色",
        price: 79,
        stockNum: 120,
        warnStock: 20,
      },
    ],
  },
  {
    id: "spu_005",
    spuName: "花西子蜜粉饼7g",
    mainImage: "https://picsum.photos/50/50?random=5",
    status: 1,
    auditStatus: 1,
    createTime: "2026-04-05",
    skuList: [
      {
        id: "sku_010",
        specAttr: "自然色",
        price: 149,
        stockNum: 60,
        warnStock: 10,
      },
    ],
  },
  {
    id: "spu_006",
    spuName: "珂拉琪唇釉3.5g",
    mainImage: "https://picsum.photos/50/50?random=6",
    status: 1,
    auditStatus: 1,
    createTime: "2026-04-06",
    skuList: [
      {
        id: "sku_011",
        specAttr: "B705焦糖奶茶",
        price: 69,
        stockNum: 150,
        warnStock: 30,
      },
    ],
  },
  {
    id: "spu_007",
    spuName: "UNNY眉笔0.1g",
    mainImage: "https://picsum.photos/50/50?random=7",
    status: 1,
    auditStatus: 1,
    createTime: "2026-04-07",
    skuList: [
      {
        id: "sku_012",
        specAttr: "深棕色",
        price: 29,
        stockNum: 200,
        warnStock: 40,
      },
    ],
  },
  {
    id: "spu_008",
    spuName: "3CE眼影盘9g",
    mainImage: "https://picsum.photos/50/50?random=8",
    status: 1,
    auditStatus: 1,
    createTime: "2026-04-08",
    skuList: [
      {
        id: "sku_013",
        specAttr: "九宫格燕麦盘",
        price: 239,
        stockNum: 45,
        warnStock: 10,
      },
    ],
  },
  {
    id: "spu_009",
    spuName: "馥蕾诗唇膏4.3g",
    mainImage: "https://picsum.photos/50/50?random=9",
    status: 1,
    auditStatus: 1,
    createTime: "2026-04-09",
    skuList: [
      {
        id: "sku_014",
        specAttr: "经典无色",
        price: 220,
        stockNum: 33,
        warnStock: 5,
      },
    ],
  },
  {
    id: "spu_010",
    spuName: "魅可生姜高光9g",
    mainImage: "https://picsum.photos/50/50?random=10",
    status: 1,
    auditStatus: 1,
    createTime: "2026-04-10",
    skuList: [
      {
        id: "sku_015",
        specAttr: "经典色",
        price: 360,
        stockNum: 28,
        warnStock: 8,
      },
    ],
  },
];

// 枚举定义
enum OrderStatus {
  PENDING_ACCEPT = "pendingAccept",
  ACCEPTED = "accepted",
  SHIPPED = "shipped",
  COMPLETED = "completed",
  EXCEPTION = "exception",
}

enum PaymentType {
  WECHAT = "wechat",
  ALIPAY = "alipay",
  BANK_CARD = "bankCard",
}

enum ExceptionType {
  ADDRESS_ERROR = "addressError",
  STOCK_OUT = "stockOut",
  USER_CANCEL = "userCancel",
  OTHER = "other",
}

// 类型定义
interface OrderItem {
  id: string;
  name: string;
  img: string;
  price: number;
  quantity: number;
  spec: string;
}

interface ReceiverAddress {
  name: string;
  phone: string;
  address: string;
}

interface Order {
  id: string;
  orderNo: string;
  items: OrderItem[];
  receiverInfo: ReceiverAddress;
  paymentType: PaymentType;
  status: OrderStatus;
  deliveryProgress: number;
  createTime: string;
  isNew: boolean;
  exceptionType?: ExceptionType;
  exceptionDesc?: string;
}

interface ExceptionModalState {
  visible: boolean;
  currentOrder?: Order;
  selectedExceptionType?: ExceptionType;
  attachmentFileList: UploadFile[];
}

interface DeliveryModalState {
  visible: boolean;
  currentOrder?: Order;
}

// 映射配置
const paymentTypeMap: Record<PaymentType, string> = {
  [PaymentType.WECHAT]: "微信支付",
  [PaymentType.ALIPAY]: "支付宝",
  [PaymentType.BANK_CARD]: "银行卡支付",
};

const orderStatusMap: Record<OrderStatus, { label: string; color: string }> = {
  [OrderStatus.PENDING_ACCEPT]: { label: "待接单", color: "orange" },
  [OrderStatus.ACCEPTED]: { label: "已接单", color: "blue" },
  [OrderStatus.SHIPPED]: { label: "已发货", color: "purple" },
  [OrderStatus.COMPLETED]: { label: "已完成", color: "green" },
  [OrderStatus.EXCEPTION]: { label: "异常订单", color: "red" },
};

const exceptionTypeMap: Record<ExceptionType, string> = {
  [ExceptionType.ADDRESS_ERROR]: "地址错误",
  [ExceptionType.STOCK_OUT]: "商品缺货",
  [ExceptionType.USER_CANCEL]: "消费者取消",
  [ExceptionType.OTHER]: "其他异常",
};

// 模拟10条订单数据（全部改为哈尔滨各区地址）
const mockOrderData: Order[] = [
  {
    id: "1",
    orderNo: "MZ20240501001",
    items: [
      {
        id: "prod1",
        name: MOCK_SPU_LIST[0].spuName,
        img: MOCK_SPU_LIST[0].mainImage,
        price: MOCK_SPU_LIST[0].skuList[0].price,
        quantity: 1,
        spec: MOCK_SPU_LIST[0].skuList[0].specAttr,
      },
    ],
    receiverInfo: {
      name: "张女士",
      phone: "13800138000",
      address: "黑龙江省哈尔滨市道里区中央大街123号",
    },
    paymentType: PaymentType.WECHAT,
    status: OrderStatus.PENDING_ACCEPT,
    deliveryProgress: 0,
    createTime: "2024-05-01 10:20:30",
    isNew: true,
  },
  {
    id: "2",
    orderNo: "MZ20240501002",
    items: [
      {
        id: "prod2",
        name: MOCK_SPU_LIST[1].spuName,
        img: MOCK_SPU_LIST[1].mainImage,
        price: MOCK_SPU_LIST[1].skuList[0].price,
        quantity: 1,
        spec: MOCK_SPU_LIST[1].skuList[0].specAttr,
      },
      {
        id: "prod3",
        name: MOCK_SPU_LIST[2].spuName,
        img: MOCK_SPU_LIST[2].mainImage,
        price: MOCK_SPU_LIST[2].skuList[0].price,
        quantity: 1,
        spec: MOCK_SPU_LIST[2].skuList[0].specAttr,
      },
    ],
    receiverInfo: {
      name: "李女士",
      phone: "13900139000",
      address: "黑龙江省哈尔滨市南岗区学府路99号",
    },
    paymentType: PaymentType.ALIPAY,
    status: OrderStatus.ACCEPTED,
    deliveryProgress: 30,
    createTime: "2024-05-01 09:15:20",
    isNew: false,
  },
  {
    id: "3",
    orderNo: "MZ20240501003",
    items: [
      {
        id: "prod4",
        name: MOCK_SPU_LIST[3].spuName,
        img: MOCK_SPU_LIST[3].mainImage,
        price: MOCK_SPU_LIST[3].skuList[0].price,
        quantity: 1,
        spec: MOCK_SPU_LIST[3].skuList[0].specAttr,
      },
    ],
    receiverInfo: {
      name: "王女士",
      phone: "13700137000",
      address: "黑龙江省哈尔滨市道外区靖宇街88号",
    },
    paymentType: PaymentType.WECHAT,
    status: OrderStatus.SHIPPED,
    deliveryProgress: 75,
    createTime: "2024-04-30 16:40:10",
    isNew: false,
  },
  {
    id: "4",
    orderNo: "MZ20240501004",
    items: [
      {
        id: "prod5",
        name: MOCK_SPU_LIST[4].spuName,
        img: MOCK_SPU_LIST[4].mainImage,
        price: MOCK_SPU_LIST[4].skuList[0].price,
        quantity: 2,
        spec: MOCK_SPU_LIST[4].skuList[0].specAttr,
      },
    ],
    receiverInfo: {
      name: "赵女士",
      phone: "13600136000",
      address: "黑龙江省哈尔滨市平房区新疆大街66号",
    },
    paymentType: PaymentType.BANK_CARD,
    status: OrderStatus.COMPLETED,
    deliveryProgress: 100,
    createTime: "2024-04-29 14:25:40",
    isNew: false,
  },
  {
    id: "5",
    orderNo: "MZ20240501005",
    items: [
      {
        id: "prod6",
        name: MOCK_SPU_LIST[5].spuName,
        img: MOCK_SPU_LIST[5].mainImage,
        price: MOCK_SPU_LIST[5].skuList[0].price,
        quantity: 1,
        spec: MOCK_SPU_LIST[5].skuList[0].specAttr,
      },
    ],
    receiverInfo: {
      name: "陈女士",
      phone: "13500135000",
      address: "黑龙江省哈尔滨市松北区世茂大道55号",
    },
    paymentType: PaymentType.ALIPAY,
    status: OrderStatus.EXCEPTION,
    deliveryProgress: 0,
    createTime: "2024-05-01 11:30:50",
    isNew: false,
    exceptionType: ExceptionType.STOCK_OUT,
    exceptionDesc: "商品库存不足",
  },
  {
    id: "6",
    orderNo: "MZ20240501006",
    items: [
      {
        id: "prod7",
        name: MOCK_SPU_LIST[6].spuName,
        img: MOCK_SPU_LIST[6].mainImage,
        price: MOCK_SPU_LIST[6].skuList[0].price,
        quantity: 1,
        spec: MOCK_SPU_LIST[6].skuList[0].specAttr,
      },
    ],
    receiverInfo: {
      name: "孙女士",
      phone: "13400134000",
      address: "黑龙江省哈尔滨市香坊区和平路33号",
    },
    paymentType: PaymentType.WECHAT,
    status: OrderStatus.PENDING_ACCEPT,
    deliveryProgress: 0,
    createTime: "2024-05-01 12:10:20",
    isNew: true,
  },
  {
    id: "7",
    orderNo: "MZ20240501007",
    items: [
      {
        id: "prod8",
        name: MOCK_SPU_LIST[7].spuName,
        img: MOCK_SPU_LIST[7].mainImage,
        price: MOCK_SPU_LIST[7].skuList[0].price,
        quantity: 1,
        spec: MOCK_SPU_LIST[7].skuList[0].specAttr,
      },
      {
        id: "prod9",
        name: MOCK_SPU_LIST[8].spuName,
        img: MOCK_SPU_LIST[8].mainImage,
        price: MOCK_SPU_LIST[8].skuList[0].price,
        quantity: 1,
        spec: MOCK_SPU_LIST[8].skuList[0].specAttr,
      },
    ],
    receiverInfo: {
      name: "周女士",
      phone: "13300133000",
      address: "黑龙江省哈尔滨市呼兰区南京路22号",
    },
    paymentType: PaymentType.ALIPAY,
    status: OrderStatus.ACCEPTED,
    deliveryProgress: 45,
    createTime: "2024-04-30 10:05:30",
    isNew: false,
  },
  {
    id: "8",
    orderNo: "MZ20240501008",
    items: [
      {
        id: "prod10",
        name: MOCK_SPU_LIST[9].spuName,
        img: MOCK_SPU_LIST[9].mainImage,
        price: MOCK_SPU_LIST[9].skuList[0].price,
        quantity: 1,
        spec: MOCK_SPU_LIST[9].skuList[0].specAttr,
      },
    ],
    receiverInfo: {
      name: "吴女士",
      phone: "13200132000",
      address: "黑龙江省哈尔滨市阿城区解放大街11号",
    },
    paymentType: PaymentType.BANK_CARD,
    status: OrderStatus.SHIPPED,
    deliveryProgress: 85,
    createTime: "2024-04-30 15:18:45",
    isNew: false,
  },
  {
    id: "9",
    orderNo: "MZ20240501009",
    items: [
      {
        id: "prod11",
        name: MOCK_SPU_LIST[0].spuName,
        img: MOCK_SPU_LIST[0].mainImage,
        price: MOCK_SPU_LIST[0].skuList[1].price,
        quantity: 2,
        spec: MOCK_SPU_LIST[0].skuList[1].specAttr,
      },
    ],
    receiverInfo: {
      name: "郑女士",
      phone: "13100131000",
      address: "黑龙江省哈尔滨市双城区花园街77号",
    },
    paymentType: PaymentType.WECHAT,
    status: OrderStatus.EXCEPTION,
    deliveryProgress: 0,
    createTime: "2024-05-01 08:40:15",
    isNew: false,
    exceptionType: ExceptionType.ADDRESS_ERROR,
    exceptionDesc: "收货地址无具体门牌号",
  },
  {
    id: "10",
    orderNo: "MZ20240501010",
    items: [
      {
        id: "prod12",
        name: MOCK_SPU_LIST[1].spuName,
        img: MOCK_SPU_LIST[1].mainImage,
        price: MOCK_SPU_LIST[1].skuList[1].price,
        quantity: 1,
        spec: MOCK_SPU_LIST[1].skuList[1].specAttr,
      },
    ],
    receiverInfo: {
      name: "马女士",
      phone: "13000130000",
      address: "黑龙江省哈尔滨市尚志市解放路44号",
    },
    paymentType: PaymentType.ALIPAY,
    status: OrderStatus.COMPLETED,
    deliveryProgress: 100,
    createTime: "2024-04-28 19:30:20",
    isNew: false,
  },
];

const { Title, Text, Paragraph } = Typography;

const OrderList: React.FC = () => {
  // 筛选状态
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null,
  );
  const [orderNoKeyword, setOrderNoKeyword] = useState("");
  const [receiverKeyword, setReceiverKeyword] = useState("");

  // 弹窗状态
  const [exceptionModal, setExceptionModal] = useState<ExceptionModalState>({
    visible: false,
    currentOrder: undefined,
    selectedExceptionType: undefined,
    attachmentFileList: [],
  });
  const [deliveryModal, setDeliveryModal] = useState<DeliveryModalState>({
    visible: false,
    currentOrder: undefined,
  });

  // 上传配置
  const uploadProps: UploadProps = {
    fileList: exceptionModal.attachmentFileList,
    onChange: ({ fileList }) => {
      setExceptionModal({ ...exceptionModal, attachmentFileList: fileList });
    },
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("仅支持JPG/PNG图片！");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("图片大小不能超过2MB！");
        return false;
      }
      return true;
    },
  };

  // 操作方法
  const handleAcceptOrder = (order: Order) => {
    message.success(`订单${order.orderNo}接单成功！`);
  };
  const handleShipOrder = (order: Order) => {
    message.success(`订单${order.orderNo}发货成功！`);
  };
  const handleOpenExceptionModal = (order: Order) => {
    setExceptionModal({
      visible: true,
      currentOrder: order,
      selectedExceptionType: order.exceptionType,
      attachmentFileList: [],
    });
  };
  const handleSubmitException = () => {
    if (
      !exceptionModal.selectedExceptionType ||
      exceptionModal.attachmentFileList.length === 0
    ) {
      message.warning("请选择异常类型并上传凭证！");
      return;
    }
    message.success(
      `订单${exceptionModal.currentOrder?.orderNo}异常处理成功！`,
    );
    setExceptionModal({ ...exceptionModal, visible: false });
  };
  const handleOpenDeliveryModal = (order: Order) => {
    setDeliveryModal({ visible: true, currentOrder: order });
  };

  // 表格列
  const columns: ColumnsType<Order> = [
    { title: "订单编号", dataIndex: "orderNo", key: "orderNo", width: 140 },
    {
      title: "商品明细",
      dataIndex: "items",
      key: "items",
      width: 280,
      render: (items: OrderItem[]) => (
        <Space direction="vertical" size="small">
          {items.map((item) => (
            <div
              key={item.id}
              style={{ display: "flex", alignItems: "center" }}
            >
              <img
                src={item.img}
                alt={item.name}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  marginRight: 8,
                }}
              />
              <div>
                <Text strong>{item.name}</Text>
                <Text type="secondary" style={{ display: "block" }}>
                  规格：{item.spec} | 数量：{item.quantity} | 单价：¥
                  {item.price}
                </Text>
              </div>
            </div>
          ))}
        </Space>
      ),
    },
    {
      title: "收货信息",
      dataIndex: "receiverInfo",
      key: "receiverInfo",
      width: 260,
      render: (info: ReceiverAddress) => (
        <div>
          <Text strong>
            {info.name} {info.phone}
          </Text>
          <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, marginTop: 4 }}>
            {info.address}
          </Paragraph>
        </div>
      ),
    },
    {
      title: "支付方式",
      dataIndex: "paymentType",
      key: "paymentType",
      width: 120,
      render: (type: PaymentType) => paymentTypeMap[type],
    },
    {
      title: "订单状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: OrderStatus) => (
        <Tag
          color={orderStatusMap[status].color}
          icon={
            status === OrderStatus.EXCEPTION ? <WarningOutlined /> : undefined
          }
        >
          {orderStatusMap[status].label}
        </Tag>
      ),
    },
    {
      title: "配送进度",
      dataIndex: "deliveryProgress",
      key: "deliveryProgress",
      width: 180,
      render: (progress: number) => (
        <div>
          <Progress
            percent={progress}
            size="small"
            status={progress === 100 ? "success" : "active"}
          />
          <Text
            type="secondary"
            style={{ display: "block", textAlign: "center", marginTop: 4 }}
          >
            {progress}%
          </Text>
        </div>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_: any, record: Order) => (
        <Space size="small">
          {record.status === OrderStatus.PENDING_ACCEPT && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleAcceptOrder(record)}
            >
              接单
            </Button>
          )}
          {record.status === OrderStatus.ACCEPTED && (
            <Button
              type="primary"
              icon={<TruckOutlined />}
              onClick={() => handleShipOrder(record)}
            >
              发货
            </Button>
          )}
          {record.status === OrderStatus.SHIPPED && (
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleOpenDeliveryModal(record)}
            >
              查看轨迹
            </Button>
          )}
          {record.status === OrderStatus.EXCEPTION && (
            <Button
              type="danger"
              icon={<FormOutlined />}
              onClick={() => handleOpenExceptionModal(record)}
            >
              异常处理
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 筛选逻辑
  const filteredData = mockOrderData.filter((order) => {
    if (statusFilter && order.status !== statusFilter) return false;
    if (orderNoKeyword && !order.orderNo.includes(orderNoKeyword)) return false;
    if (
      receiverKeyword &&
      !order.receiverInfo.name.includes(receiverKeyword) &&
      !order.receiverInfo.phone.includes(receiverKeyword)
    )
      return false;
    return true;
  });

  // 新订单高亮
  const rowClassName = (record: Order) => (record.isNew ? "new-order-row" : "");

  return (
    <div style={{ padding: 20, background: "#f5f5f5", minHeight: "100vh" }}>
      {/* 顶部筛选栏 - 已移除Card */}
      <Row
        gutter={[16, 16]}
        align="middle"
        style={{ marginBottom: 20, marginTop: 16 }}
      >
        <Col xs={24} sm={6} md={4}>
          <Select
            placeholder="订单状态筛选"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: "100%" }}
            options={[
              { label: "全部", value: "" },
              { label: "待接单", value: OrderStatus.PENDING_ACCEPT },
              { label: "已接单", value: OrderStatus.ACCEPTED },
              { label: "已发货", value: OrderStatus.SHIPPED },
              { label: "已完成", value: OrderStatus.COMPLETED },
              { label: "异常订单", value: OrderStatus.EXCEPTION },
            ]}
          />
        </Col>
        <Col xs={24} sm={10} md={8}>
          <DatePicker.RangePicker
            placeholder={["开始时间", "结束时间"]}
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: "100%" }}
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Input
            placeholder="输入订单编号搜索"
            value={orderNoKeyword}
            onChange={(e) => setOrderNoKeyword(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Input
            placeholder="输入收货人信息搜索"
            value={receiverKeyword}
            onChange={(e) => setReceiverKeyword(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col xs={24} sm={8} md={2}>
          <Button type="primary" icon={<SearchOutlined />} block>
            搜索
          </Button>
        </Col>
      </Row>

      {/* 订单列表 */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        rowClassName={rowClassName}
        pagination={{
          current: 1,
          pageSize: 10,
          total: filteredData.length,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条订单`,
        }}
        scroll={{ x: "max-content" }}
      />

      {/* 异常处理弹窗 */}
      <Modal
        title="异常订单处理"
        open={exceptionModal.visible}
        onOk={handleSubmitException}
        onCancel={() =>
          setExceptionModal({ ...exceptionModal, visible: false })
        }
        width={600}
      >
        {exceptionModal.currentOrder && (
          <div style={{ padding: 10 }}>
            <Text strong>订单编号：</Text>
            <Text>{exceptionModal.currentOrder.orderNo}</Text>
            <br />
            <Text strong>当前异常：</Text>
            <Text type="danger">
              {exceptionModal.currentOrder.exceptionDesc}
            </Text>
            <br />
            <br />
            <Select
              placeholder="选择异常类型"
              value={exceptionModal.selectedExceptionType}
              onChange={(value) =>
                setExceptionModal({
                  ...exceptionModal,
                  selectedExceptionType: value,
                })
              }
              style={{ width: "100%", marginBottom: 16 }}
              options={[
                { label: "地址错误", value: ExceptionType.ADDRESS_ERROR },
                { label: "商品缺货", value: ExceptionType.STOCK_OUT },
                { label: "消费者取消", value: ExceptionType.USER_CANCEL },
                { label: "其他异常", value: ExceptionType.OTHER },
              ]}
            />
            <Upload {...uploadProps} listType="picture-card">
              <Button icon={<UploadOutlined />}>上传凭证图片</Button>
            </Upload>
          </div>
        )}
      </Modal>

      {/* 配送轨迹弹窗 */}
      <Modal
        title="配送轨迹查看"
        open={deliveryModal.visible}
        onCancel={() => setDeliveryModal({ ...deliveryModal, visible: false })}
        width={800}
        footer={null}
      >
        {deliveryModal.currentOrder && (
          <div>
            <Title level={5}>
              订单 {deliveryModal.currentOrder.orderNo} 配送信息
            </Title>
            <div
              style={{
                lineHeight: 2,
                padding: 16,
                background: "#fff",
                borderRadius: 8,
              }}
            >
              <p>📦 物流单号：SF1234567890{deliveryModal.currentOrder.id}</p>
              <p>🚚 物流公司：顺丰速运</p>
              <p>
                📍 当前位置：
                {deliveryModal.currentOrder.deliveryProgress > 80
                  ? "配送中（距离收货地址1km）"
                  : "转运中心分拣中"}
              </p>
              <p>
                ⏰ 预计送达时间：
                {dayjs().add(1, "day").format("YYYY-MM-DD HH:mm")}
              </p>
              <div
                style={{
                  background: "#f9f9f9",
                  padding: 16,
                  borderRadius: 8,
                  marginTop: 16,
                }}
              >
                <p>
                  ✅ {dayjs().subtract(3, "hour").format("HH:mm")} -
                  商家已发货，包裹出库
                </p>
                <p>
                  ✅ {dayjs().subtract(2, "hour").format("HH:mm")} -
                  包裹到达本地转运中心
                </p>
                <p>
                  🟡 {dayjs().subtract(1, "hour").format("HH:mm")} -
                  包裹正在配送中
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style>{`.new-order-row { background-color: #fff8e6 !important; }`}</style>
    </div>
  );
};

export default OrderList;
