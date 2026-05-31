# TKS Web — Dashboard & Trang đơn hàng (chạy bằng Google Sheet)

Trang web tĩnh đặt trên **GitHub Pages**, đọc dữ liệu **trực tiếp từ Google Sheet** (endpoint
gviz, JSON) ngay trên trình duyệt — không cần backend. Mỗi ngày chỉ cần cập nhật Sheet là web
hiện số mới khi tải lại trang.

```
web/
├── config.js          ← ⭐ Dán Sheet ID vào đây (DUY NHẤT 1 chỗ cho mọi trang)
├── index.html         ← Trang chủ: TKS Dashboard
├── danh-sach-don.html ← Đầu mối: danh sách TẤT CẢ đơn (có tìm kiếm)
├── don-hang.html      ← Trang chung xem nhanh: don-hang.html?id=5143
├── don-hang-5143.html ← URL riêng của 1 đơn (ví dụ) — vỏ mỏng ~16 dòng
├── don-hang-4811.html ← URL riêng của 1 đơn (ví dụ)
├── order.css          ← Giao diện trang đơn (dùng chung mọi đơn)
├── order.js           ← Logic + bố cục trang đơn (dùng chung mọi đơn)
├── sheet.js           ← Lớp đọc Google Sheet (dùng chung mọi trang)
├── tao-trang-don.sh   ← Script tạo nhanh trang URL riêng cho 1 đơn
├── assets/
│   ├── logo-1.png     ← Logo TKT
│   └── logo-2.png     ← Logo TKS
└── README.md

Mọi trang đơn (`don-hang.html` và các `don-hang-<id>.html`) đều **dùng chung** `order.css` +
`order.js` + `config.js`. Sửa giao diện/logic chỉ cần sửa 2 file `order.*` → tất cả đơn đổi theo.
```

Thiết kế (màu, font, bố cục) lấy **nguyên** từ template đã duyệt trong skill `tao-dashboard` —
chỉ thay phần dữ liệu nhúng cứng bằng đoạn đọc-từ-Sheet.

---

## 1. Tạo Google Sheet

Tạo 1 Google Sheet, mỗi **tab** đặt tên **chính xác** như dưới. **Dòng 1 của mỗi tab là tiêu đề
cột** (đúng tên cột). Không đổi tên cột — `sheet.js` dùng tên cột làm khóa.

### Tab `Meta` — thông tin chung (dạng key/value)
| key | value |
|-----|-------|
| cap_nhat | 30/05/2026 08:30 |
| nguon | Getfly CRM · Google Chat |

### Tab `KPI` — 6 thẻ tổng quan
| label | value | sub | color |
|-------|-------|-----|-------|
| Đơn đang xử lý | 2 | Ajinomoto · Vietsovpetro | navy |

- `color`: `navy` · `amber` · `red` · `green` · *(để trống = steel mặc định)*

### Tab `DonHang` — bảng đơn hàng ngoài dashboard
| kh | kh_sub | task_id | giai_doan | tien_do | han_congno | order_id |
|----|--------|---------|-----------|---------|------------|----------|
| Ajinomoto Việt Nam | OMAC · Hệ máy ép | 23714 | Gia công cơ khí | 55 | 30/06 · 790.776.000₫ | 5143 |

- `task_id`: ID Task tổng trên Getfly → tự tạo nút **CRM ▸** và mã `#task`.
- `tien_do`: số 0–100 (phần trăm).
- `order_id`: mã dùng cho trang con — nút **Mở chi tiết** trỏ tới `don-hang.html?id=<order_id>`.

### Tab `NhanSu` — con người (3 nhóm)
| nhom | ten | vai_tro | dang_lam | hom_nay | qua_han | ke_hoach |
|------|-----|---------|----------|---------|---------|----------|
| dv | Nguyễn Văn Định | Kỹ thuật hiện trường | 24 | 3 | 2 | 5 |

- `nhom`: `dv` (Dịch vụ) · `pt` (Phụ tùng) · `sv` (Cấp phòng). 4 cột số = 4 thẻ trên mỗi người.

### Tab `DoanhSo` — doanh số 2 luồng × 3 mốc (6 dòng)
| loai | ky | actual | target |
|------|-----|--------|--------|
| dv | Tháng | 420000000 | 500000000 |

- `loai`: `dv` · `pt`. `ky`: `Tháng` · `Quý` · `Năm`. `actual`/`target`: số nguyên (đồng).
- Web tự tính % và đổi màu: ≥100% xanh · ≥50% hổ phách · <50% đỏ · 0% xám.

### Tab `LichCongTac` — lịch công tác (3 cột)
| cot | dt | desc | task_id | ppl | today |
|-----|-----|------|---------|-----|-------|
| field | 30/05 | Đi Âu Lạc kiểm tra máy Haus | 23876 | Định | 1 |

- `cot`: `field` (hiện trường) · `car` (đặt xe) · `fly` (vé máy bay/vé xe).
- `today`: điền `1` nếu là việc hôm nay (gắn nhãn cam), để trống nếu không.
- ⚠ **Không** đưa CCCD / ngày sinh vào tab này (quy ước PII).

### Tab `SuCo` — việc trễ hạn & rủi ro
| muc_do | task_id | noi_dung | tre | don | action |
|--------|---------|----------|-----|-----|--------|
| hi | 27905 | Chờ vật tư nhập khẩu cho đơn Ajinomoto | 5 ngày | #5143 | |

- `muc_do`: `hi` (Cao) · `md` (Trung bình) · `lo` (Thấp).
- `action`: (tùy chọn) link bấm mở; để trống nếu không có.

---

## 2. Chia sẻ Sheet & nối vào web

1. Trong Google Sheet: **Chia sẻ → Quyền truy cập chung → "Bất kỳ ai có đường liên kết" → vai trò "Người xem"**.
   (Chỉ cho xem, không cho sửa. Đủ để web đọc, không cần "Xuất bản lên web".)
2. Lấy **Sheet ID** trong URL: `docs.google.com/spreadsheets/d/`**`<ID nằm ở đây>`**`/edit`.
3. Mở **`config.js`**, dán ID vào: `window.TKS_SHEET_ID = "<ID>";`. Một chỗ này áp dụng cho
   TẤT CẢ trang (dashboard, danh sách, mọi trang đơn). Đẩy lại GitHub. Xong.

> Khi `SHEET_ID` để trống hoặc đọc lỗi, web hiển thị **dữ liệu mẫu** kèm dải báo màu cam,
> để bạn xem trước thiết kế trước khi nối Sheet.

---

## 3. Đưa lên GitHub Pages

1. Tạo repo mới (vd `tks-web`), đẩy toàn bộ nội dung thư mục `web/` lên nhánh `main`.
2. Repo → **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   chọn `main` / thư mục `/ (root)`. Lưu.
3. Sau ~1 phút, web ở: `https://<tài-khoản>.github.io/tks-web/`.

> GitHub Pages chỉ phục vụ file tĩnh. Mọi việc đọc Sheet diễn ra trên trình duyệt người xem,
> nên dữ liệu luôn là bản mới nhất trong Sheet (đặt `cache: no-store`).

---

## 4. Cập nhật hằng ngày (luồng vận hành)

1. Bạn nhắn mình: *"Cập nhật dashboard hôm nay"*.
2. Mình quét dữ liệu thật từ **Getfly CRM** (đúng quy trình skill `tao-dashboard` đang dùng:
   chụp token, gọi API tasks/KPI/doanh số) + lịch công tác từ Google Chat.
3. Mình ghi dữ liệu đã chuẩn hoá vào các tab Sheet ở trên — **không** dựng lại HTML.
4. Bạn tải lại trang web → số liệu mới hiện ngay.

> **Một điểm cần chốt khi nối Sheet thật:** cách ghi dữ liệu vào Sheet. Tùy quyền/kết nối
> Google của bạn, có 2 hướng: (a) mình ghi thẳng vào Sheet qua kết nối Google, hoặc
> (b) mình xuất bảng giá trị để bạn dán vào tab. Mình sẽ xác nhận hướng phù hợp khi bắt đầu
> dùng dữ liệu thật.

---

## 5. Trang đơn hàng — `don-hang.html?id=<order_id>`

Dùng chung `sheet.js` và **cùng một Sheet ID** với dashboard. Mọi tab dưới có cột `order_id`
để lọc theo đơn; dòng 1 mỗi tab là tiêu đề cột. Mở 1 đơn bằng URL:
`don-hang.html?id=5143` (giá trị `id` khớp `order_id`). Section nào không có dữ liệu sẽ tự ẩn.

### Tab `DH_Info` — **1 dòng / 1 đơn** (nhiều cột)
`order_id`, `kh`, `du_an`, `dia_chi`, `ma_crm`, `task_tong`, `lien_he`, `lien_he_meta`,
`sales`, `mua_hang`, `ncc`, `ncc_meta`, `trang_thai`, `trang_thai_meta`, `han_giao`, `han_meta`,
`bao_hanh`, `hinh_thuc_tt`, `buoc`, `cap_nhat`, `nguon`, `phai_thu`, `da_thu`,
`gantt_months`, `gantt_today`

- `task_tong`: ID Task tổng → tạo link CRM + ô "Bước hiện tại".
- `buoc`: bước hiện tại trong pipeline chuẩn — nhận 1 trong: `0,1,2,3a,3b,3c,4,5a,5b,5c,6,7`.
  Các bước trước = xanh (xong), bước này = cam.
- `phai_thu`, `da_thu`: số (đồng) → tự tính "Còn lại" và thanh tiến độ.
- `gantt_months`: nhãn cột Gantt, ngăn bằng dấu phẩy, vd `T4,T5,T6,T7,T8,T9`.
- `gantt_today`: vị trí đường "hôm nay" trên Gantt, theo **phần trăm** 0–100 (để trống = không vẽ).

### Tab `DH_CongViec` — cây công việc nhiều cấp
| order_id | cap | ten | trang_thai | pct | task_id |
|----------|-----|-----|------------|-----|---------|

- `cap`: `1` Con · `2` Cháu · `3` Chắt · `4` Chút (quyết định mức thụt vào + badge thế hệ).
- `trang_thai`: `done` · `doing` · `todo` · `late` · `confirm`.
- `pct`: số 0–100 (tùy chọn).

### Tab `DH_ToDo` — việc cần làm
| order_id | uu_tien | noi_dung | who |
|----------|---------|----------|-----|

- `uu_tien`: `hi` (Cao) · `md` (TB) · `lo` (Dõi).

### Tab `DH_Timeline` — diễn biến 2 nguồn
| order_id | nguon | dt | noi_dung |
|----------|-------|----|----------|

- `nguon`: `crm` (cột trái) · `chat` (cột phải).

### Tab `DH_HangMuc` — hạng mục đơn hàng
| order_id | stt | model | thong_so | sl | dvt | ghi_chu |
|----------|-----|-------|----------|----|----|---------|

### Tab `DH_HoSo` — hồ sơ & tài liệu
| order_id | ngay | tep | loai | loai_mau | ghi_chu |
|----------|------|-----|------|----------|---------|

- `loai_mau` (màu nhãn loại): `done` · `now` · `wait` · `warn`.

### Tab `DH_Gantt` — tiến độ dự kiến (tùy chọn, để trống thì ẩn Gantt)
| order_id | pha | meta | offset | width | mau |
|----------|-----|------|--------|-------|-----|

- `offset`, `width`: vị trí & độ dài thanh theo **phần trăm** chiều ngang biểu đồ (0–100).
- `mau`: `done` (xanh) · `now` (cam) · `plan` (xanh thép) · `key` (navy đậm).
- Các mốc Gantt là **dự kiến** — trang tự ghi chú điều này.

> **Lưu ý hiển thị:** trang đơn cố tình bỏ qua thông tin nhạy cảm; mọi số/trạng thái lấy từ
> Getfly CRM. Khi mở `don-hang.html` mà chưa nối Sheet hoặc thiếu `?id=`, trang hiện đơn mẫu 5143.

---

## 6. Mở rộng nhiều đơn & cập nhật hằng ngày (mô hình vận hành)

**Không cần tạo file HTML cho mỗi đơn.** `don-hang.html` là template động dùng chung cho mọi
đơn — chỉ khác tham số `?id=`. Vì vậy:

- **Thêm 1 đơn mới** = thêm dòng vào các tab `DH_*` (mình quét từ Getfly và đổ vào Sheet khi
  bạn yêu cầu). Ngay sau đó đơn có mặt tại `don-hang.html?id=<mã>` và tự xuất hiện trong
  `danh-sach-don.html`. Số lượng đơn không giới hạn.
- **Cập nhật hằng ngày cho TẤT CẢ đơn** = một lần làm mới Sheet. Mọi trang (dashboard, danh
  sách, từng đơn) đọc trực tiếp Sheet nên cùng cập nhật khi tải lại — không phải sửa từng file.

### URL riêng cho mỗi đơn (đang dùng)
Mỗi đơn có một trang URL gọn riêng: `don-hang-5143.html`, `don-hang-4811.html`, …
Đây là file "vỏ" ~16 dòng, chỉ đặt `window.ORDER_ID` rồi nạp `order.css` + `order.js` +
`config.js` dùng chung. Vì vậy:

- Thêm đơn mới = (1) thêm dữ liệu đơn vào các tab `DH_*` trong Sheet, (2) tạo 1 file vỏ
  `don-hang-<mã>.html`. Tạo vỏ chỉ mất vài giây — mình làm khi bạn yêu cầu, hoặc chạy
  `./tao-trang-don.sh 5200 "Tên KH · dự án"`.
- Mọi trang đơn dùng chung `order.js`/`order.css`, nên **sửa template một chỗ là tất cả
  trang đơn đổi theo**; **cập nhật dữ liệu hằng ngày vẫn chỉ là làm mới Sheet**.
- `danh-sach-don.html` tự liệt kê đơn từ Sheet; (tuỳ chọn) có thể trỏ nút "Mở chi tiết" sang
  URL riêng `don-hang-<mã>.html` thay vì `don-hang.html?id=<mã>` — nói nếu bạn muốn đổi.

### Quy trình hằng ngày (nhiều đơn)
1. Bạn nhắn: *"Cập nhật toàn bộ hôm nay"*.
2. Mình quét Getfly cho dashboard + tất cả đơn đang theo dõi, đổ vào Sheet (Meta, KPI, DonHang,
   NhanSu, DoanhSo, LichCongTac, SuCo và các tab `DH_*` của từng đơn).
3. Bạn tải lại web — toàn bộ trang hiện số mới.
