export interface GlossaryTerm {
  id: string;
  label: string;
  meaningVi: string;
  explanation: string;
  example: string;
  whyItMatters: string;
  sourceRefs: string[];
  status: "draft" | "published";
}

const sourceRefs = ["project:english-generative-core-v1", "ai-support-review:2026-08-31"];

export const GLOSSARY_TERMS: readonly GlossaryTerm[] = [
  { id: "finite-verb", label: "finite verb", meaningVi: "động từ hữu hạn", explanation: "Dạng động từ đang gánh thông tin ngữ pháp trung tâm của mệnh đề, thường là tense và agreement. Một auxiliary cũng có thể là finite verb.", example: "She walks: walks là finite. She is walking: is là finite.", whyItMatters: "Tìm đúng finite verb giúp suy ra câu hỏi, phủ định và cấu trúc auxiliary.", sourceRefs, status: "draft" },
  { id: "non-finite-verb", label: "non-finite verb", meaningVi: "dạng động từ không hữu hạn", explanation: "Dạng động từ không tự gánh tense/agreement của mệnh đề, như to-infinitive, -ing form hoặc participle trong nhiều cấu trúc.", example: "She is walking: walking là non-finite; is mới là finite.", whyItMatters: "Nó giúp tách nghĩa từ vựng của verb khỏi phần đang gánh ngữ pháp.", sourceRefs, status: "draft" },
  { id: "clause", label: "clause", meaningVi: "mệnh đề", explanation: "Một đơn vị tổ chức một sự việc hoặc trạng thái quanh predicate và các vai trò liên quan; thường có một finite carrier.", example: "The child opened the door là một clause.", whyItMatters: "Clause là khung gốc để phân tích và tự tạo câu.", sourceRefs, status: "draft" },
  { id: "subject", label: "subject", meaningVi: "chủ ngữ", explanation: "Thành phần mà clause lấy làm điểm xuất phát ngữ pháp; nó thường đứng trước finite verb trong câu trần thuật tiếng Anh.", example: "The child opened the door: The child là subject.", whyItMatters: "Subject không luôn đồng nghĩa với người gây hành động, nhất là trong passive.", sourceRefs, status: "draft" },
  { id: "predicate", label: "predicate", meaningVi: "vị ngữ", explanation: "Phần của clause nói điều gì về subject, thường xoay quanh verb và những thành phần verb cần hoặc cho phép.", example: "The room is quiet: is quiet là predicate.", whyItMatters: "Nó giúp nhìn câu như quan hệ ý nghĩa thay vì chỉ là chuỗi từ.", sourceRefs, status: "draft" },
  { id: "object", label: "object", meaningVi: "tân ngữ", explanation: "Một complement thường biểu thị người hoặc vật chịu tác động hay tham gia vào quan hệ do verb mở ra.", example: "The child opened the door: the door là object.", whyItMatters: "Không phải mọi cụm đứng sau verb đều là object.", sourceRefs, status: "draft" },
  { id: "complement", label: "complement", meaningVi: "thành phần do head lựa chọn", explanation: "Thành phần hoàn thiện pattern nghĩa hoặc cấu trúc mà một head như verb, adjective hay noun yêu cầu hoặc lựa chọn chặt chẽ.", example: "Put the keys on the table: on the table là complement quan trọng của put.", whyItMatters: "Complement giải thích vì sao biết nghĩa riêng lẻ của verb vẫn chưa đủ để dựng câu.", sourceRefs, status: "draft" },
  { id: "adjunct", label: "adjunct", meaningVi: "thành phần phụ tự do", explanation: "Thông tin thêm về thời gian, nơi chốn, cách thức hoặc hoàn cảnh; thường có thể bỏ mà pattern lõi vẫn còn.", example: "She worked yesterday: yesterday là adjunct.", whyItMatters: "Tách adjunct khỏi complement giúp thấy phần lõi và phần mở rộng của clause.", sourceRefs, status: "draft" },
  { id: "modifier", label: "modifier", meaningVi: "thành phần bổ nghĩa", explanation: "Từ hoặc cụm giới hạn, mô tả hoặc làm rõ một head.", example: "the small robot: small là modifier của robot.", whyItMatters: "Modifier giúp mở rộng ý mà không làm mất head trung tâm.", sourceRefs, status: "draft" },
  { id: "tense", label: "tense", meaningVi: "thì như một phạm trù hình thức", explanation: "Cách hình thức verb góp phần định vị hoặc nhìn sự việc, nổi bật nhất là đối lập present và past trong tiếng Anh.", example: "works và worked thể hiện đối lập hình thức present/past.", whyItMatters: "Tense không đồng nhất với toàn bộ nghĩa thời gian của câu.", sourceRefs, status: "draft" },
  { id: "aspect", label: "aspect", meaningVi: "thể / cách nhìn diễn tiến", explanation: "Cách người nói đóng khung sự việc, chẳng hạn đang diễn tiến (progressive) hoặc nhìn lại qua một mốc (perfect).", example: "is working là progressive; has worked là perfect.", whyItMatters: "Aspect trả lời câu hỏi khác tense nên không nên học chung thành một bảng tên thì.", sourceRefs, status: "draft" },
  { id: "modality", label: "modality", meaningVi: "tình thái", explanation: "Cách biểu thị khả năng, nghĩa vụ, dự đoán, cho phép hoặc thái độ của người nói với mệnh đề.", example: "She may leave: may biểu thị một mức khả năng.", whyItMatters: "Modality giải thích nhiều lựa chọn modal mà một nhãn thời gian không bao quát được.", sourceRefs, status: "draft" },
  { id: "auxiliary", label: "auxiliary", meaningVi: "trợ động từ", explanation: "Verb hỗ trợ mang thông tin ngữ pháp như tense, aspect, voice, modality, question hoặc negation.", example: "She has left: has là auxiliary.", whyItMatters: "Auxiliary thường là nơi diễn ra đảo, thêm not và agreement.", sourceRefs, status: "draft" },
  { id: "lexical-verb", label: "lexical verb", meaningVi: "động từ mang nghĩa từ vựng chính", explanation: "Verb biểu thị event, action hoặc state cốt lõi; nó có thể tự là finite hoặc xuất hiện sau auxiliary ở dạng non-finite.", example: "She walks / She has walked: walk mang lexical meaning trong cả hai.", whyItMatters: "Nó tách câu đang nói về việc gì khỏi cách câu đóng gói ngữ pháp.", sourceRefs, status: "draft" },
  { id: "determiner", label: "determiner", meaningVi: "từ hạn định", explanation: "Thành phần giúp xác định cách một noun phrase quy chiếu, như a, the, this, some hoặc my.", example: "the key, a key, my key.", whyItMatters: "Chọn determiner phụ thuộc meaning, countability và người nghe nhận diện đối tượng ra sao.", sourceRefs, status: "draft" },
  { id: "noun-phrase", label: "noun phrase", meaningVi: "cụm danh từ", explanation: "Cụm có noun hoặc pronoun làm head, có thể kèm determiner và modifier, và hoạt động như một đơn vị trong clause.", example: "the small robot là một noun phrase.", whyItMatters: "Clause roles thường do cả noun phrase đảm nhiệm, không chỉ một từ.", sourceRefs, status: "draft" },
  { id: "reference", label: "reference", meaningVi: "quy chiếu", explanation: "Cách biểu thức ngôn ngữ giúp người nghe xác định người, vật hoặc ý đang được nói tới trong ngữ cảnh.", example: "a key giới thiệu; the key có thể nhắc lại vật đã xác định.", whyItMatters: "Reference nối article, pronoun và mạch discourse thành một cơ chế chung.", sourceRefs, status: "draft" },
  { id: "valency", label: "valency", meaningVi: "khung vai trò của verb", explanation: "Pattern các complement và vai trò mà một sense của verb thường mở ra.", example: "give thường mở người cho, vật cho và người nhận.", whyItMatters: "Valency giúp dự đoán một verb cần cấu trúc gì thay vì ghép từ ngẫu nhiên.", sourceRefs, status: "draft" },
  { id: "subordination", label: "subordination", meaningVi: "quan hệ chính–phụ giữa mệnh đề", explanation: "Cơ chế để một clause phụ thuộc và làm thành phần hoặc bổ sung nghĩa cho clause lớn hơn.", example: "I know that she left: that she left là subordinate clause.", whyItMatters: "Nó cho phép tạo ý phức tạp từ các clause nhỏ mà vẫn rõ quan hệ.", sourceRefs, status: "draft" },
  { id: "relative-clause", label: "relative clause", meaningVi: "mệnh đề quan hệ", explanation: "Clause gắn với một noun phrase để nhận diện hoặc thêm thông tin về referent.", example: "the book that I bought.", whyItMatters: "Dấu phẩy hay không dấu phẩy phản ánh vai trò quy chiếu, không chỉ là trang trí.", sourceRefs, status: "draft" },
  { id: "discourse", label: "discourse", meaningVi: "mạch lời nói hoặc văn bản", explanation: "Cách nhiều câu phối hợp để người nghe theo dõi referent, thông tin cũ–mới, mục tiêu và quan hệ giữa các ý.", example: "Giới thiệu a proposal rồi dùng the proposal để duy trì mạch.", whyItMatters: "Một câu đúng ngữ pháp vẫn có thể khó hiểu nếu đặt sai trong discourse.", sourceRefs, status: "draft" },
  { id: "collocation", label: "collocation", meaningVi: "kết hợp từ quen dùng", explanation: "Những từ có xu hướng đi cùng nhau theo thói quen ngôn ngữ, dù nhiều tổ hợp khác vẫn có thể hiểu về mặt logic.", example: "make a decision tự nhiên hơn do a decision.", whyItMatters: "Collocation là ranh giới giữa câu chỉ đúng cấu trúc và câu nghe tự nhiên.", sourceRefs, status: "draft" },
  { id: "prosody", label: "prosody", meaningVi: "nhịp điệu, trọng âm và ngữ điệu", explanation: "Lớp tổ chức âm thanh trên chuỗi lời nói, gồm prominence, rhythm và pitch movement.", example: "Nhấn SEND trong Can you SEND it again? để làm nổi bật hành động.", whyItMatters: "Prosody giúp người nghe nhận ra focus và cấu trúc trước khi phân tích từng âm.", sourceRefs, status: "draft" },
  { id: "phoneme", label: "phoneme", meaningVi: "âm vị", explanation: "Đơn vị âm thanh trừu tượng có thể tạo khác biệt nghĩa trong một ngôn ngữ.", example: "/p/ và /b/ phân biệt pat và bat.", whyItMatters: "Phoneme là bản đồ phân biệt nghĩa, không phải một âm vật lý bất biến.", sourceRefs, status: "draft" },
  { id: "morpheme", label: "morpheme", meaningVi: "hình vị", explanation: "Đơn vị nhỏ nhất mang nghĩa hoặc chức năng ngữ pháp, có thể là một từ hoặc một phần của từ.", example: "walked gồm walk và morpheme past -ed.", whyItMatters: "Morpheme nối cấu tạo từ với tense, number và các pattern sinh từ.", sourceRefs, status: "draft" },
];

const glossaryById = new Map(GLOSSARY_TERMS.map((term) => [term.id, term]));

export function glossaryTermsFor(ids: readonly string[] | undefined): GlossaryTerm[] {
  return [...new Set(ids ?? [])].map((id) => glossaryById.get(id)).filter((term): term is GlossaryTerm => Boolean(term));
}

export function hasGlossaryTerm(id: string): boolean {
  return glossaryById.has(id);
}
