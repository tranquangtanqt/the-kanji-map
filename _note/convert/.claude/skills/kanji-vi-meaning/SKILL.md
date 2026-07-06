---
name: kanji-vi-meaning
description: Add a Vietnamese gloss to every "meaning" field in the kanji JSON files under in/ (plain string meanings, and {"english": "..."} objects), then write the result to out/. Use when asked to add Vietnamese meanings/translations to the kanji data, process files in the in folder, or run the vi-meaning conversion for this project.
---

# Kanji Vietnamese meaning

Mục tiêu: với mỗi file `in/<kanji>.json`, tìm mọi trường khóa `"meaning"` (dù giá trị là
chuỗi, hay object dạng `{"english": "..."}`), chèn thêm `" |(vi) " + nghĩa tiếng Việt`
vào cuối chuỗi đó, rồi ghi file kết quả ra `out/<kanji>.json`.

Nghĩa tiếng Việt phải được suy ra dựa trên **cả** nghĩa tiếng Nhật (từ/kanji, cách đọc,
ví dụ đi kèm) **và** nghĩa tiếng Anh đã có sẵn — không dịch máy móc chỉ từ tiếng Anh.

## Quy trình cho mỗi file trong `in/*.json`

1. Chạy script trích xuất để lấy danh sách các trường `meaning` còn thiếu bản dịch:

   ```
   node "<thư-mục-chứa-SKILL.md-này>/scripts/extract-meanings.js" "in/<file>.json"
   ```

   (`scripts/` luôn nằm ngay cạnh file SKILL.md này — dù skill được đặt ở
   `.claude/skills/kanji-vi-meaning/` của project hay ở `~/.claude/skills/kanji-vi-meaning/`
   dùng chung cho mọi project. Thay `<thư-mục-chứa-SKILL.md-này>` bằng đường dẫn thật của
   thư mục chứa chính file SKILL.md đang được đọc. Lệnh vẫn chạy với cwd là gốc project
   đang chứa `in/`/`out/`.)

   Kết quả là một mảng JSON, mỗi phần tử có dạng:

   ```json
   {
     "path": ["kanjialiveData", "examples", 0, "meaning", "english"],
     "text": "first-year student",
     "context": { "japanese": "一年生（いちねんせい）" },
     "kanji": "一"
   }
   ```

   - `path`: đường dẫn khóa trong JSON tới chuỗi cần bổ sung.
   - `text`: nghĩa tiếng Anh/nghĩa gốc hiện có.
   - `context`: các trường lân cận cho biết ngữ cảnh tiếng Nhật (japanese, reading,
     onyomi, kunyomi, example, character, name, symbol...).
   - `kanji`: chữ Hán của cả file (trường `id` gốc).
   - Nếu mảng rỗng, file không có gì để thêm — vẫn copy nguyên văn sang `out/` (bước 4).

2. Với mỗi phần tử, tự suy nghĩ và viết một nghĩa tiếng Việt ngắn gọn, tự nhiên, phù hợp
   với từ điển Hán-Việt/Nhật-Việt, dựa trên cả `context` (tiếng Nhật) lẫn `text` (tiếng Anh).
   Giữ văn phong ngắn gọn tương tự bản gốc (nếu bản gốc liệt kê nhiều nghĩa cách nhau bởi
   dấu phẩy, nghĩa tiếng Việt cũng nên liệt kê tương ứng).

   **Riêng khi `isRadical: true`** (trường `meaning` nằm trực tiếp trong object `radical`,
   tức bộ thủ của kanji): giá trị `vi` phải có dạng
   `"<Hán Việt> (<nghĩa tiếng Việt>)"` — tức thêm âm Hán Việt của bộ thủ đó (suy ra từ
   `context.symbol`/`context.character`) đứng trước, rồi mới tới nghĩa tiếng Việt trong
   ngoặc đơn. Ví dụ: bộ thủ `一` → `"Nhất (một, nét ngang)"`; bộ thủ `二` → `"Nhị (hai)"`;
   bộ thủ `口` → `"Khẩu (miệng, lỗ mở)"`; bộ thủ `女` → `"Nữ (phụ nữ, giống cái)"`; bộ thủ
   `阜`/`阝` → `"Phụ (gò đất, đê)"`. Các trường `meaning` khác (không phải radical) thì vẫn
   chỉ ghi nghĩa tiếng Việt thuần, không thêm Hán Việt.

3. Gom toàn bộ bản dịch thành một file JSON tạm (ví dụ trong thư mục scratchpad), đúng
   định dạng mảng `{ "path": [...], "vi": "..." }` với `path` lấy y nguyên từ bước 1:

   ```json
   [
     { "path": ["kanjialiveData", "meaning"], "vi": "một" },
     { "path": ["kanjialiveData", "examples", 0, "meaning", "english"], "vi": "học sinh năm nhất" }
   ]
   ```

4. Áp dụng bản dịch và ghi ra `out/`:

   ```
   node "<thư-mục-chứa-SKILL.md-này>/scripts/apply-meanings.js" "in/<file>.json" "<translations-tam>.json" "out/<file>.json"
   ```

   Script này idempotent: nếu một chuỗi đã chứa `|(vi)` thì sẽ bị bỏ qua, không nối thêm
   lần nữa. Nếu bước 1 trả về mảng rỗng, chỉ cần copy file gốc sang `out/<file>.json`
   (không cần chạy apply-meanings.js).

## Lưu ý

- Chỉ xử lý các file thực sự tồn tại trong `in/` (dùng `ls`/Glob để liệt kê, đừng đoán tên).
- Giữ nguyên toàn bộ cấu trúc/khóa khác của JSON, chỉ nối thêm vào cuối các chuỗi `meaning`
  (hoặc `meaning.english`) đúng như mô tả ở trên — không xóa, không đổi thứ tự khóa.
- Ví dụ chuyển đổi mong muốn:
  - `"meaning": "one, one radical (no.1)"` → `"meaning": "one, one radical (no.1) |(vi) một, bộ một (số 1)"`
  - `"meaning": { "english": "first-year student" }` → `"meaning": { "english": "first-year student |(vi) học sinh năm nhất" } }`
  - Riêng trong `"radical": { "symbol": "二", "meaning": "two" }` (isRadical: true)
    → `"meaning": "two |(vi) Nhị (hai)"` (Hán Việt của bộ thủ + nghĩa tiếng Việt trong ngoặc).
- Sau khi xử lý xong tất cả các file được yêu cầu, báo cáo ngắn gọn danh sách file đã ghi
  vào `out/`.
