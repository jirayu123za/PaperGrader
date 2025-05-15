import Konva from 'konva';

export function createBoundingBoxGroup(box: any, selectShape: (group: Konva.Group) => void): Konva.Group {
  const group = new Konva.Group({
    x: parseFloat(box.bounding_box_position.split(',')[0]),
    y: parseFloat(box.bounding_box_position.split(',')[1]),
    draggable: true,
  });

  const width = parseFloat(box.bounding_box_position.split(',')[2]);
  const height = parseFloat(box.bounding_box_position.split(',')[3]);

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

  const titleText = new Konva.Text({
    text: box.bounding_box_type === 'question'
      ? `Question ${box.question_number ?? ''} (${box.question_point ?? ''} pts)`
      : box.bounding_box_type === 'name' ? 'Name Region' : 'ID Region',
    fontSize: 12,
    fill: 'white',
    padding: 2,
    align: 'left',
    x: 5,
    y: 4,
  });

  const titleBar = new Konva.Rect({
    width,
    height: 20,
    fill: 'rgba(0,0,0,0.7)',
    listening: false,
  });

  group.add(background);
  group.add(titleBar);
  group.add(titleText);

  group.on('click', () => {
    selectShape(group);
  });

  return group;
}
