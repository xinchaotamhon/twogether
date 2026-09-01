import fs from "node:fs";

const packetPath = "content/drafts/english-core-beginner-revision-v2.json";
const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));

const bridges = [
  {
    id: "core-en-bridge-02",
    node_id: "core-en-module-02",
    card_type: "core_recall",
    prompt: "Trong ‘She walks’ và ‘She is walking’, từ nào cho biết việc chính, từ nào đang giúp câu mang dấu hiệu ngữ pháp? Hãy giải thích trước bằng lời thường.",
    model_answer: "Cả hai câu đều nói về việc đi bộ. Ở ‘She walks’, walks vừa mang nghĩa đi bộ vừa mang dấu hiệu của câu. Ở ‘She is walking’, walking mang nghĩa việc đang diễn ra, còn is giúp gánh dấu hiệu ngữ pháp. Từ giúp như is được gọi là auxiliary.",
    explanation: "Tách việc câu nói về điều gì khỏi từ đang gánh cấu trúc giúp hiểu câu hỏi, phủ định và các chuỗi verb sau này.",
    misconception: "Mọi verb trong một câu đều cùng làm một công việc và đều mang tense.",
    transfer_prompt: "Phân tích ‘They have finished’: từ nào giúp tạo cấu trúc và từ nào nói việc đã hoàn thành?",
    transfer_answer: "Have là từ trợ giúp tạo perfect; finished mang nghĩa việc hoàn thành. Have đang gánh dấu hiệu hữu hạn của câu.",
    glossary_refs: ["auxiliary", "lexical-verb", "finite-verb", "aspect"],
    prerequisite_node_ids: ["core-en-module-01"],
  },
  {
    id: "core-en-bridge-03",
    node_id: "core-en-module-03",
    card_type: "core_recall",
    prompt: "Với câu ‘Lan likes tea’, muốn hỏi hoặc phủ định thì tiếng Anh cần một chỗ mang dấu hiệu của câu. Nếu chưa có từ trợ giúp, ta làm gì?",
    model_answer: "Ta thêm do: ‘Does Lan like tea?’ và ‘Lan does not like tea.’ Does mang dấu hiệu phù hợp với Lan; like trở về dạng gốc. Đây là cơ chế do-support.",
    explanation: "Thay vì học riêng từng mẫu hỏi và phủ định, ta tìm từ trợ giúp đang mang cấu trúc rồi đảo nó hoặc đặt not sau nó.",
    misconception: "Có does thì verb chính vẫn phải thêm -s: ‘Does Lan likes…?’",
    transfer_prompt: "Đổi ‘Hoàng watched the film’ thành câu hỏi và câu phủ định.",
    transfer_answer: "‘Did Hoàng watch the film?’ và ‘Hoàng did not watch the film.’ Did đã mang quá khứ nên watch dùng dạng gốc.",
    glossary_refs: ["auxiliary", "finite-verb", "lexical-verb"],
    prerequisite_node_ids: ["core-en-module-02"],
  },
  {
    id: "core-en-bridge-04",
    node_id: "core-en-module-04",
    card_type: "core_recall",
    prompt: "Một câu không chỉ cho biết ‘khi nào’. Nó còn cho biết người nói nhìn sự việc ra sao và chắc đến mức nào. Trong ‘She may be working’, ba lớp đó nằm ở đâu?",
    model_answer: "May cho biết mức khả năng của người nói; be + working nhìn việc như đang diễn ra; mốc thời gian cụ thể cần context. Các lớp này lần lượt liên quan đến modality, aspect và time/tense.",
    explanation: "Tách ba câu hỏi giúp tránh coi mọi khác biệt verb là một danh sách ‘thì’ phải thuộc lòng.",
    misconception: "Tên một tense tự quyết định đầy đủ thời gian, góc nhìn và mức chắc chắn của cả câu.",
    transfer_prompt: "Phân tích ‘They must have left’: lớp nào nói mức chắc chắn và lớp nào nhìn việc rời đi như đã xảy ra trước mốc nói?",
    transfer_answer: "Must biểu thị suy luận khá chắc; have + left tạo perfect, nhìn việc rời đi như đã xảy ra trước mốc đang nói. Mốc chính xác vẫn dựa vào context.",
    glossary_refs: ["tense", "aspect", "modality", "auxiliary"],
    prerequisite_node_ids: ["core-en-module-02"],
  },
  {
    id: "core-en-bridge-05",
    node_id: "core-en-module-05",
    card_type: "core_recall",
    prompt: "Trong ‘the two small robots’, từ nào gọi tên loại vật, còn các từ khác giúp người nghe chọn đúng nhóm như thế nào?",
    model_answer: "Robots là từ chính. The giúp người nghe tìm nhóm đã xác định; two cho số lượng; small mô tả. Cả nhóm hoạt động như một cụm danh từ (noun phrase).",
    explanation: "Học noun phrase như một gói quy chiếu giúp hiểu article, số lượng và mô tả cùng phục vụ việc người nghe nhận ra đối tượng.",
    misconception: "Noun phrase chỉ là một noun; các từ xung quanh không ảnh hưởng việc người nghe biết ta nói vật nào.",
    transfer_prompt: "Phân tích ‘those three messages from Hoàng’ theo từ chính và các lớp giúp xác định.",
    transfer_answer: "Messages là từ chính; those chỉ nhóm đang được trỏ tới; three cho số lượng; from Hoàng thu hẹp nguồn của messages.",
    glossary_refs: ["noun-phrase", "determiner", "modifier", "reference"],
    prerequisite_node_ids: ["core-en-module-01"],
  },
  {
    id: "core-en-bridge-06",
    node_id: "core-en-module-06",
    card_type: "core_recall",
    prompt: "Bắt đầu từ ‘The child found the key’. Phần nào là lõi không thể bỏ nếu vẫn muốn kể cùng sự việc, và ta có thể gắn thêm những lớp nào?",
    model_answer: "Lõi là người/vật liên quan và việc trung tâm: the child – found – the key. Ta có thể thêm mô tả cho danh từ, nơi chốn, thời gian hoặc một mệnh đề phụ, miễn vẫn nhìn ra lõi.",
    explanation: "Nhìn câu như lõi cộng các lớp mở rộng giúp tạo câu dài mà không mất cấu trúc hay ý chính.",
    misconception: "Câu dài là một mẫu hoàn toàn mới phải nhớ nguyên khối.",
    transfer_prompt: "Mở rộng ‘The student submitted the assignment’ bằng một mô tả và một lớp thời gian, rồi chỉ lại câu lõi.",
    transfer_answer: "‘The tired student submitted the assignment after class.’ Tired mô tả student; after class thêm thời gian; lõi vẫn là ‘The student submitted the assignment.’",
    glossary_refs: ["clause", "modifier", "adjunct", "subordination"],
    prerequisite_node_ids: ["core-en-module-01", "core-en-module-05"],
  },
  {
    id: "core-en-bridge-07",
    node_id: "core-en-module-07",
    card_type: "core_recall",
    prompt: "Sau ‘I bought a lamp’, vì sao câu tiếp theo thường bắt đầu bằng ‘It’ rồi mới nói điều mới về chiếc đèn?",
    model_answer: "It nhắc lại chiếc đèn người nghe vừa biết, tạo điểm bám. Phần sau đưa thông tin mới. Đây là một cách tổ chức mạch lời nói từ điều đã biết sang điều mới.",
    explanation: "Ngữ pháp đúng chưa đủ; người nghe còn cần biết ta đang tiếp tục nói về vật nào và thông tin nào là trọng tâm.",
    misconception: "Các câu đúng riêng lẻ đặt theo bất kỳ thứ tự nào cũng tạo một đoạn dễ hiểu như nhau.",
    transfer_prompt: "Viết hai câu: giới thiệu một cuốn sách rồi dùng điểm bám để nói điều mới về nó.",
    transfer_answer: "‘I found a useful book. It explains English clauses clearly.’ It nối lại book; explains… là thông tin mới.",
    glossary_refs: ["reference", "discourse", "noun-phrase"],
    prerequisite_node_ids: ["core-en-module-01", "core-en-module-05"],
  },
  {
    id: "core-en-bridge-08",
    node_id: "core-en-module-08",
    card_type: "core_recall",
    prompt: "Vì sao ‘Can you send it?’ khi nói nhanh có thể không nghe giống bốn từ tách rời trên giấy? Người nghe dựa vào đâu để chia lại?",
    model_answer: "Âm không nhấn có thể nhẹ đi và các từ nối với nhau, nên ranh giới từ mờ. Người nghe kết hợp âm nổi bật, nhịp, cấu trúc quen và context để khôi phục can | you | send | it.",
    explanation: "Nghe không phải chép từng âm độc lập; đó là quá trình dùng cả tín hiệu âm thanh và dự đoán có kiểm chứng.",
    misconception: "Nếu không nghe rõ từng âm như từ điển thì người nói đã phát âm sai hoặc mình không thể hiểu câu.",
    transfer_prompt: "Với ‘Did you check it?’, nêu một chỗ có thể bị nối/nhẹ và cách dùng cấu trúc để kiểm tra dự đoán.",
    transfer_answer: "Did you có thể nghe gần như một cụm nối. Ta dự đoán mẫu câu hỏi quá khứ did + subject + base verb, rồi kiểm xem check có ở dạng gốc và context có nói về việc đã xảy ra không.",
    glossary_refs: ["prosody", "clause", "auxiliary"],
    prerequisite_node_ids: ["core-en-module-03", "core-en-module-07"],
  },
  {
    id: "core-en-bridge-09",
    node_id: "core-en-module-09",
    card_type: "core_recall",
    prompt: "Vì sao học từ ‘run’ chỉ bằng một nghĩa tiếng Việt vẫn chưa đủ để tự dùng nó trong câu mới?",
    model_answer: "Ta cần nối dạng từ với từng nghĩa và cách dùng: run five kilometres, run a business, run out of time. Những mối nối với mẫu câu và từ thường đi cùng tạo thành mạng từ vựng.",
    explanation: "Một danh sách dịch rời không cho biết sense nào đang dùng, từ đi với gì và tình huống nào nghe tự nhiên.",
    misconception: "Biết một bản dịch phổ biến đồng nghĩa với biết mọi cách dùng của từ.",
    transfer_prompt: "Tạo một mạng nhỏ cho ‘make’: một nghĩa, hai collocation và một câu mới.",
    transfer_answer: "Make có nghĩa rộng liên quan tạo/thực hiện; hai collocation là make a decision và make progress. Ví dụ: ‘We made good progress today.’",
    glossary_refs: ["collocation", "reference", "morpheme"],
    prerequisite_node_ids: ["core-en-module-06", "core-en-module-08"],
  },
  {
    id: "core-en-bridge-10",
    node_id: "core-en-module-10",
    card_type: "core_recall",
    prompt: "Khi gặp một ý mới cần nói, bốn bước đơn giản nào giúp bạn đi từ ý nghĩa đến một câu có thể kiểm tra và sửa?",
    model_answer: "Một đường đi hữu ích là: (1) nói rõ ý định, (2) chọn ai/làm gì/với gì, (3) thêm thời gian, góc nhìn hoặc mức chắc chắn, (4) chọn từ/cụm tự nhiên rồi nói và kiểm tra bằng input hay phản hồi.",
    explanation: "Bước tích hợp nối các nguyên lý thành quy trình sinh câu; nó không đòi nhớ lại toàn bộ thuật ngữ trước khi nói.",
    misconception: "Muốn tự tạo câu phải dịch trọn câu tiếng Việt hoặc nhớ đúng một mẫu đã học.",
    transfer_prompt: "Dùng bốn bước để diễn đạt ý ‘Hoàng có thể đã quên chìa khóa’.",
    transfer_answer: "Ý là khả năng về một việc đã xảy ra; Hoàng là người quên, key là vật bị quên; might thêm khả năng và have forgotten nhìn việc như đã xảy ra trước: ‘Hoàng might have forgotten the key.’",
    glossary_refs: ["clause", "modality", "aspect", "collocation"],
    prerequisite_node_ids: ["core-en-module-01", "core-en-module-04", "core-en-module-09"],
  },
];

packet.cards = packet.cards
  .filter((card) => !bridges.some((bridge) => bridge.id === card.id))
  .map((card) => {
    const { card_id: _cardId, ...clean } = card;
    return {
      ...clean,
      prerequisite_node_ids: clean.prerequisite_node_ids.filter(
        (id) => id !== clean.node_id,
      ),
    };
  });

for (const bridge of bridges) {
  packet.cards.push({
    ...bridge,
    track: "english",
    status: "review",
    author: "codex",
    reviewer: null,
    source_refs: [
      "human-feedback:hiep-2026-09-01",
      "content-style:hiep-hoang-v1",
      "fresh-novice-audit:2026-09-01",
    ],
    revision_reason: "new_beginner_bridge",
  });
}

for (const collection of packet.collections) {
  const bridge = bridges.find((candidate) => candidate.node_id === collection.node_id);
  const existing = packet.cards
    .filter((card) => card.node_id === collection.node_id && card.id !== bridge?.id)
    .map((card) => card.id);
  collection.card_ids = bridge ? [bridge.id, ...existing] : existing;
}

packet.provenance.note += " Nine new bridge cards make modules 02–10 teachable before their denser cards; collection sizes are therefore variable.";
fs.writeFileSync(packetPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");
console.log(`English beginner revision: ${packet.cards.length} cards.`);

