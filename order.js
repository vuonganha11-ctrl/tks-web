/* ====================================================================
   order.js — Dựng & render trang chi tiết 1 đơn hàng.
   Dùng chung cho don-hang.html (?id=) và mọi trang don-hang-<id>.html.
   Trang vỏ chỉ cần: <div class="wrap" id="app"></div> + nạp config.js, sheet.js, order.js
   (đặt window.ORDER_ID = "<mã đơn>" nếu muốn cố định 1 đơn).
   ==================================================================== */
var LAYOUT = "  <div id=\"sampleBanner\" style=\"display:none;background:var(--amber-soft);border:1px solid #e7cf98;color:#7a5a00;border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:13px;font-weight:600\"></div>\n\n  <!-- HERO -->\n  <div class=\"hero\">\n    <div class=\"kick\">THEO DÕI ĐƠN HÀNG · THAI KHUONG</div>\n    <h1 id=\"heroTitle\">—</h1>\n    <div class=\"cust\" id=\"heroCust\"></div>\n    <div class=\"codeline\" id=\"heroChips\"></div>\n    <div class=\"right\">\n      <span class=\"logo-plate plate-tkt\"><img src=\"assets/logo-1.png\" alt=\"TKT\"></span>\n      <span class=\"logo-plate\"><img src=\"assets/logo-2.png\" alt=\"TKS\"></span>\n    </div>\n  </div>\n\n  <!-- TOP ROW: hạn giao · bước hiện tại · cập nhật -->\n  <section style=\"margin-top:22px\">\n    <div class=\"toprow\">\n      <div class=\"deadline\">\n        <div class=\"dl-ic\">&#9203;</div>\n        <div><div class=\"dl-k\">Hạn giao hàng</div><div class=\"dl-v\" id=\"dlDate\">—</div></div>\n        <div class=\"dl-meta\" id=\"dlMeta\"></div>\n      </div>\n      <div class=\"updated stagecard\">\n        <div class=\"u-k\">Bước hiện tại</div>\n        <div class=\"u-meta\" id=\"stageName\">—</div>\n        <div class=\"u-id\" id=\"stageId\">—</div>\n      </div>\n      <div class=\"updated\">\n        <div class=\"u-k\">Cập nhật mới nhất</div>\n        <div class=\"u-v\" id=\"updDate\">—</div>\n        <div class=\"u-meta\" id=\"updMeta\"></div>\n      </div>\n    </div>\n  </section>\n\n  <!-- PIPELINE -->\n  <section>\n    <div class=\"sec-h\"><span class=\"no\">&#9635;</span><h2>Tiến độ xử lý</h2><span class=\"line\"></span></div>\n    <div class=\"card pad\">\n      <div class=\"pipe\" id=\"pipe\"></div>\n      <div class=\"legend\"><span><i style=\"background:var(--green)\"></i>Hoàn thành</span><span><i style=\"background:var(--amber)\"></i>Đang ở bước này</span><span><i style=\"background:var(--ice)\"></i>Chưa tới</span></div>\n    </div>\n  </section>\n\n  <!-- GANTT -->\n  <section id=\"ganttSec\" style=\"display:none\">\n    <div class=\"sec-h\"><span class=\"no\">&#9638;</span><h2>Gantt — tiến độ dự án (dự kiến)</h2><span class=\"line\"></span></div>\n    <div class=\"gwrap\"><div class=\"gantt\" id=\"gantt\"></div></div>\n  </section>\n\n  <!-- CÂY CÔNG VIỆC -->\n  <section>\n    <div class=\"sec-h\"><span class=\"no\">&#9745;</span><h2>Việc đang làm</h2><span class=\"line\"></span></div>\n    <div class=\"tree\" id=\"tree\"></div>\n    <div class=\"tlegend\"><span><b class=\"g1\">Con</b>cấp 1</span><span><b class=\"g2\">Cháu</b>cấp 2</span><span><b class=\"g3\">Chắt</b>cấp 3</span><span><b class=\"g4\">Chút</b>cấp 4</span></div>\n  </section>\n\n  <!-- VIỆC CẦN LÀM -->\n  <section id=\"todoSec\">\n    <div class=\"sec-h\"><span class=\"no\">&#10003;</span><h2>Việc cần làm</h2><span class=\"line\"></span></div>\n    <div class=\"card pad\"><ul class=\"todo\" id=\"todo\"></ul></div>\n  </section>\n\n  <!-- DIỄN BIẾN -->\n  <section>\n    <div class=\"sec-h\"><span class=\"no\">&#8627;</span><h2>Diễn biến chính — theo nguồn</h2><span class=\"line\"></span></div>\n    <div class=\"cols\" style=\"display:grid;grid-template-columns:1fr 1fr;gap:16px\">\n      <div class=\"card pad\"><div style=\"font-family:'Saira Condensed',sans-serif;font-weight:800;color:var(--navy);margin-bottom:10px\">Getfly CRM</div><div class=\"tl crm\" id=\"tlCrm\"></div></div>\n      <div class=\"card pad\"><div style=\"font-family:'Saira Condensed',sans-serif;font-weight:800;color:var(--navy);margin-bottom:10px\">Google Chat</div><div class=\"tl chat\" id=\"tlChat\"></div></div>\n    </div>\n  </section>\n\n  <!-- THÔNG TIN CHÍNH -->\n  <section>\n    <div class=\"sec-h\"><span class=\"no\">i</span><h2>Thông tin chính</h2><span class=\"line\"></span></div>\n    <div class=\"grid\" id=\"infoGrid\"></div>\n  </section>\n\n  <!-- HẠNG MỤC -->\n  <section id=\"hangmucSec\" style=\"display:none\">\n    <div class=\"sec-h\"><span class=\"no\">&#9881;</span><h2>Hạng mục đơn hàng</h2><span class=\"line\"></span></div>\n    <div class=\"card\" style=\"overflow-x:auto\"><table>\n      <thead><tr><th style=\"width:34px\">#</th><th>Model &amp; thông số</th><th style=\"width:60px\">SL</th><th style=\"width:70px\">ĐVT</th><th>Ghi chú</th></tr></thead>\n      <tbody id=\"hmBody\"></tbody>\n    </table></div>\n  </section>\n\n  <!-- THANH TOÁN -->\n  <section>\n    <div class=\"sec-h\"><span class=\"no\">&#8363;</span><h2>Thanh toán</h2><span class=\"line\"></span></div>\n    <div class=\"card pad\">\n      <div class=\"pay\">\n        <div class=\"pcard due\"><div class=\"l\">Phải thu</div><div class=\"n mono\" id=\"payDue\">0</div></div>\n        <div class=\"pcard paid\"><div class=\"l\">Đã thu</div><div class=\"n mono\" id=\"payPaid\">0</div></div>\n        <div class=\"pcard left\"><div class=\"l\">Còn lại</div><div class=\"n mono\" id=\"payLeft\">0</div></div>\n      </div>\n      <div class=\"pbar\"><i id=\"payBar\" style=\"width:0%\"></i></div>\n    </div>\n  </section>\n\n  <!-- HỒ SƠ -->\n  <section id=\"hosoSec\" style=\"display:none\">\n    <div class=\"sec-h\"><span class=\"no\">&#128462;</span><h2>Hồ sơ &amp; tài liệu</h2><span class=\"line\"></span></div>\n    <div class=\"card\" style=\"overflow:hidden\"><table>\n      <thead><tr><th style=\"width:90px\">Ngày</th><th>Tệp / Tài liệu</th><th style=\"width:160px\">Loại</th><th>Ghi chú</th></tr></thead>\n      <tbody id=\"hosoBody\"></tbody>\n    </table></div>\n  </section>\n\n  <footer id=\"footer\"></footer>\n  <div style=\"text-align:center;margin-top:14px\"><a href=\"index.html\" style=\"font-size:12px;color:var(--steel);text-decoration:none\">&#8592; Về Dashboard</a></div>";

/* ===== CẤU HÌNH: dùng CHUNG một Sheet ID với index.html ===== */
var SHEET_ID = (window.TKS_SHEET_ID || "");
var TABS_DH = ["DH_Info", "DH_CongViec", "DH_ToDo", "DH_Timeline", "DH_HangMuc", "DH_HoSo", "DH_Gantt"];

/* Pipeline chuẩn TKT (đánh dấu trạng thái theo cột "buoc" trong DH_Info) */
var PIPELINE = [
  { num: "0", nm: "Tạo đơn" }, { num: "1", nm: "PO / Hợp đồng" }, { num: "2", nm: "Tạm ứng" },
  { num: "3a", nm: "Mua hàng" }, { num: "3b", nm: "Khai hải quan" }, { num: "3c", nm: "Về kho" },
  { num: "4", nm: "Lắp đặt" }, { num: "5a", nm: "Sẵn sàng giao" }, { num: "5b", nm: "Đang giao" },
  { num: "5c", nm: "Giao xong" }, { num: "6", nm: "Nghiệm thu" }, { num: "7", nm: "TT đợt cuối" }
];

/* ===== DỮ LIỆU MẪU (đơn 5143) ===== */
var SAMPLE = {
  DH_Info: [{
    order_id: "5143", kh: "Ajinomoto Việt Nam", du_an: "OMAC", dia_chi: "KCN Biên Hòa I, Đồng Nai",
    ma_crm: "5143", task_tong: "23714", lien_he: "Lê Minh Nghĩa", lien_he_meta: "0848 716 012",
    sales: "Lê Anh Vũ (PKD MN)", mua_hang: "Võ Văn Mạnh", ncc: "OMAC — Italy", ncc_meta: "Lead ~10 tuần · ĐC Nord",
    trang_thai: "Đã duyệt", trang_thai_meta: "Tạo 20/04 · Ký 01/05 · Duyệt 22/05/2026",
    han_giao: "31/08/2026", han_meta: "KH cần ~15/09 · còn ~3 tháng", bao_hanh: "12 tháng", hinh_thuc_tt: "Chuyển khoản · 3 đợt",
    buoc: "1", cap_nhat: "30/05/2026 08:30", nguon: "Getfly CRM · Google Chat",
    phai_thu: "790776000", da_thu: "0",
    gantt_months: "T4,T5,T6,T7,T8,T9", gantt_today: "26"
  }],
  DH_CongViec: [
    { order_id: "5143", cap: "1", ten: "ĐÓNG GÓI, BẢO QUẢN & VẬN CHUYỂN", trang_thai: "todo", pct: "0", task_id: "28906" },
    { order_id: "5143", cap: "1", ten: "QA/QC (Mục 14–19)", trang_thai: "doing", pct: "30", task_id: "28902" },
    { order_id: "5143", cap: "2", ten: "Kiểm tra vật liệu đầu vào", trang_thai: "done", pct: "100", task_id: "28910" },
    { order_id: "5143", cap: "1", ten: "TÀI LIỆU kỹ thuật", trang_thai: "late", pct: "0", task_id: "28903" }
  ],
  DH_ToDo: [
    { order_id: "5143", uu_tien: "hi", noi_dung: "Chốt hợp đồng & lấy chữ ký số", who: "Lê Anh Vũ" },
    { order_id: "5143", uu_tien: "md", noi_dung: "Theo dõi thu tạm ứng đợt 1", who: "Kế toán" }
  ],
  DH_Timeline: [
    { order_id: "5143", nguon: "crm", dt: "20/04", noi_dung: "Tạo & duyệt đơn AV0001.REV04" },
    { order_id: "5143", nguon: "crm", dt: "22/05", noi_dung: "Duyệt lại đơn (Lê Trúc Phương)" },
    { order_id: "5143", nguon: "chat", dt: "18/05", noi_dung: "KH gửi PO đã ký số (PO_LEN_26049)" },
    { order_id: "5143", nguon: "chat", dt: "28/05", noi_dung: "Chốt 3 đầu bơm OMAC; hỏi phí Air" }
  ],
  DH_HangMuc: [
    { order_id: "5143", stt: "1", model: "Bơm OMAC B325", thong_so: "Q=3650 l/h", sl: "1", dvt: "bộ", ghi_chu: "Dual wing antiseizure" },
    { order_id: "5143", stt: "2", model: "Bơm OMAC B115", thong_so: "Q=6650 l/h", sl: "1", dvt: "bộ", ghi_chu: "ĐC Nord" }
  ],
  DH_HoSo: [
    { order_id: "5143", ngay: "20/04", tep: "AV0001.REV05.pdf", loai: "Báo giá TKT→KH", loai_mau: "done", ghi_chu: "Đóng mộc gửi KH" },
    { order_id: "5143", ngay: "18/05", tep: "PO_LEN_26049.pdf", loai: "PO khách hàng", loai_mau: "done", ghi_chu: "Đã ký số" }
  ],
  DH_Gantt: [
    { order_id: "5143", pha: "0 · Tạo & duyệt đơn", meta: "20/04 – 22/05", offset: "0", width: "18", mau: "done" },
    { order_id: "5143", pha: "1 · PO / Hợp đồng", meta: "22/05 – 10/06", offset: "18", width: "12", mau: "now" },
    { order_id: "5143", pha: "3 · Sản xuất tại OMAC", meta: "~15/06 – 24/08 · ~10 tuần", offset: "33", width: "45", mau: "plan" },
    { order_id: "5143", pha: "4 · Vận chuyển", meta: "~20/08 – 05/09", offset: "78", width: "16", mau: "key" }
  ]
};

/* ===== Tiện ích ===== */
var esc = Sheet.esc, num = Sheet.num, vnd = Sheet.vnd, task = Sheet.getflyTask;
function $(id) { return document.getElementById(id); }
function showBanner(msg) { var b = $("sampleBanner"); b.textContent = "ⓘ " + msg; b.style.display = "block"; }
function rowsFor(arr, id) { return (arr || []).filter(function (r) { return String(r.order_id).trim() === String(id).trim(); }); }

/* ===== Render ===== */
function renderHero(info) {
  $("heroTitle").textContent = (info.kh || "—") + (info.du_an ? " · " + info.du_an : "");
  $("heroCust").textContent = info.dia_chi || "";
  var chips = [];
  if (info.order_id) chips.push('<span class="chip">DH' + esc(info.order_id) + "</span>");
  if (info.ma_crm) chips.push('<span class="chip"><a href="https://thaikhuong.getflycrm.com/#/orders" target="_blank">CRM #' + esc(info.ma_crm) + "</a></span>");
  if (info.task_tong) chips.push('<span class="chip"><a href="' + task(info.task_tong) + '" target="_blank">Task #' + esc(info.task_tong) + "</a></span>");
  $("heroChips").innerHTML = chips.join("");
}
function renderTop(info) {
  $("dlDate").textContent = info.han_giao || "—";
  $("dlMeta").textContent = info.han_meta || "";
  var step = PIPELINE.find(function (s) { return s.num === String(info.buoc).trim(); });
  $("stageName").textContent = step ? ("Bước " + step.num + " · " + step.nm) : "—";
  $("stageId").innerHTML = info.task_tong ? '<a href="' + task(info.task_tong) + '" target="_blank">#' + esc(info.task_tong) + "</a>" : "—";
  $("updDate").textContent = info.cap_nhat || "—";
  $("updMeta").textContent = info.nguon || "";
}
function renderPipeline(info) {
  var cur = String(info.buoc).trim();
  var curIdx = PIPELINE.findIndex(function (s) { return s.num === cur; });
  $("pipe").innerHTML = PIPELINE.map(function (s, i) {
    var cls = curIdx >= 0 && i < curIdx ? " done" : (i === curIdx ? " now" : "");
    return '<div class="step' + cls + '"><div class="bar"></div><div class="dot"></div><div class="num">' + esc(s.num) + '</div><div class="nm">' + esc(s.nm) + "</div></div>";
  }).join("");
}
function renderGantt(info, rows) {
  var months = String(info.gantt_months || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
  if (!rows.length || !months.length) { $("ganttSec").style.display = "none"; return; }
  $("ganttSec").style.display = "";
  var today = num(info.gantt_today);
  var head = '<div class="g-head"><div></div><div class="g-months" style="grid-template-columns:repeat(' + months.length + ',1fr)">' +
    months.map(function (m) { return "<span>" + esc(m) + "</span>"; }).join("") + "</div></div>";
  var body = rows.map(function (r) {
    var off = Math.max(0, Math.min(100, num(r.offset)));
    var w = Math.max(2, Math.min(100 - off, num(r.width)));
    var mau = ({ done: "b-done", now: "b-now", plan: "b-plan", key: "b-key" })[(r.mau || "plan")] || "b-plan";
    var todayLine = today ? '<i class="g-today" style="left:' + today + '%"></i>' : "";
    var lbl = '<div class="g-lbl">' + esc(r.pha) + (r.meta ? "<small>" + esc(r.meta) + "</small>" : "") + "</div>";
    var track = '<div class="g-track" style="background-size:calc(100%/' + months.length + ') 100%">' + todayLine +
      '<i class="g-bar ' + mau + '" style="left:' + off + "%;width:" + w + '%"></i></div>';
    return '<div class="g-row">' + lbl + track + "</div>";
  }).join("");
  $("gantt").innerHTML = head + body;
}
function renderTree(info, rows) {
  var gen = { "1": ["Con", "g1", "lv1"], "2": ["Cháu", "g2", "lv2"], "3": ["Chắt", "g3", "lv3"], "4": ["Chút", "g4", "lv4"] };
  var stat = {
    done: ["i-done", "&#10003;", "s-done", "Hoàn thành"],
    doing: ["i-doing", "&#9680;", "s-doing", "Đang tiến hành"],
    todo: ["i-todo", "&#9675;", "s-todo", "Chưa làm"],
    late: ["i-late", "!", "s-late", "Chậm"],
    confirm: ["i-doing", "&#9680;", "s-confirm", "Chờ xác nhận"]
  };
  var parent = '<div class="tnode tparent">&#128451; DH' + esc(info.order_id) + " — Task tổng" +
    (info.task_tong ? ' · <a href="' + task(info.task_tong) + '" target="_blank" style="color:#ffd27a;text-decoration:none">#' + esc(info.task_tong) + "</a>" : "") + "</div>";
  var nodes = rows.map(function (r) {
    var g = gen[String(r.cap).trim()] || gen["1"];
    var s = stat[(r.trang_thai || "todo").toLowerCase()] || stat.todo;
    var deep = num(r.cap) >= 3 ? " deep" : "";
    var idLink = r.task_id ? '<a class="tid-link" href="' + task(r.task_id) + '" target="_blank">#' + esc(r.task_id) + "</a>" : "";
    var pct = (r.pct !== "" && r.pct != null) ? " · " + num(r.pct) + "%" : "";
    return '<div class="tnode tchild ' + g[2] + '"><span class="tico ' + s[0] + '">' + s[1] + "</span>" +
      idLink + '<span class="tgen ' + g[1] + '">' + g[0] + '</span>' +
      '<span class="tname' + deep + '">' + esc(r.ten) + "</span>" +
      '<span class="tstat ' + s[2] + '">' + s[3] + pct + "</span></div>";
  }).join("");
  $("tree").innerHTML = parent + nodes;
}
function renderTodo(rows) {
  if (!rows.length) { $("todoSec").style.display = "none"; return; }
  var pr = { hi: ["pr-hi", "Cao"], md: ["pr-md", "TB"], lo: ["pr-lo", "Dõi"] };
  $("todo").innerHTML = rows.map(function (r) {
    var p = pr[(r.uu_tien || "md").toLowerCase()] || pr.md;
    return '<li><span class="pr ' + p[0] + '">' + p[1] + '</span><div style="flex:1">' + esc(r.noi_dung) +
      (r.who ? '<div class="who">' + esc(r.who) + "</div>" : "") + "</div></li>";
  }).join("");
}
function renderTimeline(rows) {
  function col(src) {
    var evs = rows.filter(function (r) { return (r.nguon || "").toLowerCase() === src; });
    return evs.map(function (r) {
      return '<div class="ev"><div class="d">' + esc(r.dt) + '</div><div class="x">' + esc(r.noi_dung) + "</div></div>";
    }).join("") || '<div class="ev"><div class="x" style="color:var(--grey)">Chưa có diễn biến.</div></div>';
  }
  $("tlCrm").innerHTML = col("crm");
  $("tlChat").innerHTML = col("chat");
}
function renderInfo(info) {
  var kvs = [
    ["Khách hàng", info.kh, info.dia_chi],
    ["Liên hệ nhận hàng", info.lien_he, info.lien_he_meta],
    ["Sales / Mua hàng", info.sales, info.mua_hang ? "Mua hàng: " + info.mua_hang : ""],
    ["Nhà cung cấp", info.ncc, info.ncc_meta],
    ["Trạng thái đơn", info.trang_thai, info.trang_thai_meta],
    ["Hình thức thanh toán", info.hinh_thuc_tt, ""],
    ["Bảo hành", info.bao_hanh, ""]
  ];
  $("infoGrid").innerHTML = kvs.filter(function (k) { return k[1]; }).map(function (k) {
    return '<div class="kv"><div class="k">' + esc(k[0]) + '</div><div class="v">' + esc(k[1]) +
      (k[2] ? "<small>" + esc(k[2]) + "</small>" : "") + "</div></div>";
  }).join("");
}
function renderHangmuc(rows) {
  if (!rows.length) { $("hangmucSec").style.display = "none"; return; }
  $("hangmucSec").style.display = "";
  $("hmBody").innerHTML = rows.map(function (r) {
    return "<tr><td>" + esc(r.stt) + '</td><td><div class="model">' + esc(r.model) + "</div>" +
      (r.thong_so ? '<div class="spec">' + esc(r.thong_so) + "</div>" : "") + "</td>" +
      '<td class="num-r">' + esc(r.sl) + "</td><td>" + esc(r.dvt) + "</td><td>" + esc(r.ghi_chu) + "</td></tr>";
  }).join("");
}
function renderPay(info) {
  var due = num(info.phai_thu), paid = num(info.da_thu), left = due - paid;
  $("payDue").textContent = vnd(due);
  $("payPaid").textContent = vnd(paid);
  $("payLeft").textContent = vnd(left);
  $("payBar").style.width = (due ? Math.round(paid / due * 100) : 0) + "%";
}
function renderHoso(rows) {
  if (!rows.length) { $("hosoSec").style.display = "none"; return; }
  $("hosoSec").style.display = "";
  var tg = { done: "t-done", now: "t-now", wait: "t-wait", warn: "t-warn" };
  $("hosoBody").innerHTML = rows.map(function (r) {
    var cls = tg[(r.loai_mau || "done").toLowerCase()] || "t-done";
    return "<tr><td>" + esc(r.ngay) + "</td><td><b>" + esc(r.tep) + "</b></td><td>" +
      (r.loai ? '<span class="tag ' + cls + '">' + esc(r.loai) + "</span>" : "") + "</td><td>" + esc(r.ghi_chu) + "</td></tr>";
  }).join("");
}
function renderFooter(info) {
  $("footer").innerHTML = "Nguồn: " + esc(info.nguon || "Getfly CRM") + " · Cập nhật: " + esc(info.cap_nhat || "—") +
    '<div class="note">Các mốc Gantt/lịch sản xuất là <b>dự kiến</b>. Số liệu trạng thái/%/ngày lấy từ Getfly CRM.</div>';
}

function renderAll(data, id) {
  var info = rowsFor(data.DH_Info, id)[0] || {};
  if (!info.order_id) info.order_id = id;
  renderHero(info);
  renderTop(info);
  renderPipeline(info);
  renderGantt(info, rowsFor(data.DH_Gantt, id));
  renderTree(info, rowsFor(data.DH_CongViec, id));
  renderTodo(rowsFor(data.DH_ToDo, id));
  renderTimeline(rowsFor(data.DH_Timeline, id));
  renderInfo(info);
  renderHangmuc(rowsFor(data.DH_HangMuc, id));
  renderPay(info);
  renderHoso(rowsFor(data.DH_HoSo, id));
  renderFooter(info);
}

/* ===== BOOT ===== */
(async function () {
  document.getElementById("app").innerHTML = LAYOUT;
  var id = (window.ORDER_ID || new URLSearchParams(location.search).get("id") || "");
  var data, useSample = false;

  async function fetchAllTolerant() {
    var out = {};
    await Promise.all(TABS_DH.map(async function (t) {
      try { out[t] = await Sheet.fetchTab(SHEET_ID.trim(), t); }
      catch (e) { console.warn("Bỏ qua tab", t, e); out[t] = []; }
    }));
    return out;
  }

  if (SHEET_ID && SHEET_ID.trim()) {
    data = await fetchAllTolerant();
    if (!(data.DH_Info && data.DH_Info.length)) {
      data = SAMPLE; useSample = true;
      showBanner("Không đọc được dữ liệu đơn hàng — đang dùng dữ liệu mẫu. Kiểm tra Sheet ID, tên tab DH_* và quyền chia sẻ.");
    }
  } else {
    data = SAMPLE; useSample = true;
    showBanner("Chưa cấu hình Sheet ID — đang hiển thị dữ liệu mẫu (đơn 5143).");
  }

  if (!id) {
    id = (data.DH_Info[0] || {}).order_id || "";
    if (!useSample) showBanner("URL thiếu ?id=<mã đơn> — đang hiển thị đơn đầu tiên (#" + id + ").");
  } else if (!useSample && !rowsFor(data.DH_Info, id).length) {
    showBanner("Không tìm thấy đơn #" + id + " trong tab DH_Info.");
  }

  renderAll(data, id);
})();
