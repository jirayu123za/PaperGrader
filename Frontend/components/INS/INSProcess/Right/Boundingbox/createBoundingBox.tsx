import Konva from 'konva';

export function createBoundingBoxGroup(box: any, selectShape: (group: Konva.Group) => void): Konva.Group {
  const x = parseFloat(box.bounding_box_position.split(',')[0]);
  const y = parseFloat(box.bounding_box_position.split(',')[1]);
  const width = parseFloat(box.bounding_box_position.split(',')[2]);
  const height = parseFloat(box.bounding_box_position.split(',')[3]);

  const group = new Konva.Group({
    x,
    y,
    draggable: true,
  });

  // Create title bar (above the bounding box)
  const titleBarHeight = 20;
  const titleBar = new Konva.Rect({
    x: 0,
    y: -titleBarHeight, // move above the box
    width: width,
    height: titleBarHeight,
    fill: 'rgba(0,0,0,0.7)',
    listening: false,
  });

  // Create title text (fixed font size, not stretchable)
  const titleText = new Konva.Text({
    text: box.bounding_box_type === 'question'
      ? `Question ${box.question_number ?? ''} (${box.question_point ?? ''} pts)`
      : box.bounding_box_type === 'name' ? 'Student Name ' : 'Student ID',
    fontSize: 12,
    fill: 'white',
    x: 5,
    y: -titleBarHeight + 2,
    listening: false,
  });

  const background = new Konva.Rect({
    width,
    height,
    fill: box.bounding_box_type === 'question' ? 'rgba(255,0,0,0.1)' : 'rgba(0,0,255,0.1)',
    stroke:
      box.bounding_box_type === 'question' ? 'red' :
      box.bounding_box_type === 'name' ? 'blue' :
      box.bounding_box_type === 'id' ? 'green' : 'black',
    strokeWidth: 2,
    listening: true,
  });

  group.add(background);
  group.add(titleBar);
  group.add(titleText);

  group.on('click', () => {
    selectShape(group);
  });

  return group;
}
