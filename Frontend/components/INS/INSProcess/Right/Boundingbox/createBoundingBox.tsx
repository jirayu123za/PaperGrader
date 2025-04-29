import Konva from 'konva';

export function createBoundingBoxGroup(
  box: any,
  selectShape: (group: Konva.Group) => void
): Konva.Group {
  const group = new Konva.Group({
    x: parseFloat(box.bounding_box_position.split(',')[0]),
    y: parseFloat(box.bounding_box_position.split(',')[1]),
    draggable: true,
  });

  const width = parseFloat(box.bounding_box_position.split(',')[2]);
  const height = parseFloat(box.bounding_box_position.split(',')[3]);

  // Map สี stroke
  const strokeColor =
    box.bounding_box_type === 'name' ? 'blue' :
    box.bounding_box_type === 'id' ? 'green' :
    box.bounding_box_type === 'question' ? 'red' : 'black';

  // พื้นหลังสีอ่อนแบบโปร่งใสตาม stroke
  const background = new Konva.Rect({
    width,
    height,
    fill:
      box.bounding_box_type === 'name' ? 'rgba(0,0,255,0.1)' :   // ฟ้าอ่อนโปร่งใส
      box.bounding_box_type === 'id' ? 'rgba(0,128,0,0.1)' :     // เขียวอ่อนโปร่งใส
      box.bounding_box_type === 'question' ? 'rgba(255,0,0,0.1)' : // แดงอ่อนโปร่งใส
      'rgba(0,0,0,0.1)', // ดำอ่อน
    stroke: strokeColor,
    strokeWidth: 2,
    listening: false,
  });

  // Title Bar ด้านบน
  const titleBar = new Konva.Rect({
    width,
    height: 20,
    fill:
      box.bounding_box_type === 'name' ? '#0044cc' : // น้ำเงินเข้ม
      box.bounding_box_type === 'id' ? '#008800' :   // เขียวเข้ม
      box.bounding_box_type === 'question' ? '#cc0000' : // แดงเข้ม
      'black',
    listening: false,
  });

  // Text แบบ Dynamic จริง
  const titleText = new Konva.Text({
    text: getTitleText(box),
    fontSize: 12,
    fill: 'white',
    padding: 2,
    align: 'left',
    x: 5,
    y: 4,
  });

  group.add(background);
  group.add(titleBar);
  group.add(titleText);

  group.on('click', () => {
    selectShape(group);
  });

  group.on('dragend', () => {
    const newX = group.x();
    const newY = group.y();
    console.log('dragged group to:', newX, newY);
  });

  return group;
}

// 🛠 ฟังก์ชันช่วย generate text title
function getTitleText(box: any): string {
  if (box.bounding_box_type === 'name') {
    return 'Name';
  }
  if (box.bounding_box_type === 'id') {
    return 'Student ID';
  }
  if (box.bounding_box_type === 'question') {
    const questionNumber = box.question_number || 'Q?'; // ต้องมีข้อมูล question_number
    const points = box.question_point ?? '?';            // หรือคะแนน
    return `Question ${questionNumber} (${points} pts)`;
  }
  return '';
}
