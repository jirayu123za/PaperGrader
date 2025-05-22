import Konva from 'konva';

function parsePosition(pos: string): { x: number; y: number; width: number; height: number } {
  if (!pos) return { x: 0, y: 0, width: 100, height: 100 };

  const match = pos.match(/\(([^,]+),([^\)]+)\),\(([^,]+),([^\)]+)\)/);
  if (!match) {
    const parts = pos.split(',').map(parseFloat);
    return {
      x: parts[0] || 0,
      y: parts[1] || 0,
      width: parts[2] || 100,
      height: parts[3] || 100,
    };
  }

  return {
    x: parseFloat(match[1]),
    y: parseFloat(match[2]),
    width: parseFloat(match[3]),
    height: parseFloat(match[4]),
  };
}

export function createBoundingBoxGroup(box: any, selectShape: (group: Konva.Group) => void): Konva.Group {
  const { x, y, width, height } = parsePosition(box.bounding_box_position);

  const group = new Konva.Group({
    x,
    y,
    draggable: true,
  });

  const titleBarHeight = 20;
  const fixedTextWidth = 160;

  const background = new Konva.Rect({
    name: 'background',
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

  const titleBar = new Konva.Rect({
    name: 'titleBar',
    x: 0,
    y: -titleBarHeight,
    width,
    height: titleBarHeight,
    fill: 'rgba(0,0,0,0.7)',
    listening: false,
  });

  const titleText = new Konva.Text({
    name: 'titleText',
    text: box.bounding_box_type === 'question'
      ? `Question ${box.question_number ?? ''} (${box.question_point ?? ''} pts)`
      : box.bounding_box_type === 'name' ? 'Student Name ' : 'Student ID',
    fontSize: 12,
    fill: 'white',
    x: 5,
    y: -titleBarHeight + 2,
    width: fixedTextWidth,
    ellipsis: true,
    listening: false,
  });

  group.add(background);
  group.add(titleBar);
  group.add(titleText);

  group.on('click', () => {
    selectShape(group);
  });

  group.on('dragend transformend', () => {
    const background = group.findOne('.background') as Konva.Rect;
    const titleBar = group.findOne('.titleBar') as Konva.Rect;
    const titleText = group.findOne('.titleText') as Konva.Text;

    const updatedX = group.x();
    const updatedY = group.y();

    const updatedWidth = background.width() * background.scaleX();
    const updatedHeight = background.height() * background.scaleY();

    background.scale({ x: 1, y: 1 });

    if (titleBar) titleBar.width(updatedWidth);

    if (titleText) {
      titleText.setAttrs({
        scaleX: 1,
        scaleY: 1,
        width: fixedTextWidth,
        ellipsis: true,
      });
    }

    const newPosition = `(${updatedX},${updatedY}),(${updatedWidth},${updatedHeight})`;

    const bounding_box_id = box.bounding_box_id;
    const { updateBoundingBox } = require('@/store/BoundingBox/useBoundingBoxStore').default.getState();
    updateBoundingBox(bounding_box_id, {
      bounding_box_position: newPosition,
    });
  });

  return group;
}
