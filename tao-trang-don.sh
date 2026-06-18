#!/usr/bin/env bash
# Tạo nhanh trang URL riêng cho 1 đơn:  ./tao-trang-don.sh 5200 "Tên KH · dự án"
id="$1"; title="${2:-$1}"
cat > "don-hang-$id.html" <<HTML
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Đơn $title — TKS</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Saira:wght@400;500;600;700&family=Saira+Condensed:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="order.css">
</head>
<body>
<div class="wrap" id="app"></div>
<script src="config.js"></script>
<script src="supabase.js"></script>
<script>window.ORDER_ID = "$id";</script>
<script src="order.js"></script>
</body>
</html>
HTML
echo "Đã tạo don-hang-$id.html"
