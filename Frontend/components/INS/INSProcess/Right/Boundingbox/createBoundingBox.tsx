import Konva from 'konva';


export function createBoundingBoxGroup(
  box: any,
  selectShape: (node: Konva.Node) => void
): Konva.Group {
  const x = box.point_x ?? box.bounding_box_point_x ?? 0;
  const y = box.point_y ?? box.bounding_box_point_y ?? 0;
  const width = box.width ?? box.bounding_box_width ?? 120;
  const height = box.height ?? box.bounding_box_height ?? 80;
  const label = box.question_title ?? 'Question';

  const group = new Konva.Group({
    x,
    y,
    draggable: true,
    name: 'bboxGroup',
  });

  const titleBarHeight = 20;
  const textWidth = 160; 


  const background = new Konva.Rect({
    name: 'background',
    x: 0,
    y: 0,
    width,
    height,
    cornerRadius: 4,
    fill: 'rgba(59,130,246,0.08)',
    stroke: '#3B82F6',
    strokeWidth: 2,
  });

  const titleBar = new Konva.Rect({
    name: 'titleBar',
    x: 0,
    y: 0,
    width,
    height: titleBarHeight,
    fill: 'rgba(59,130,246,0.15)',
    listening: false,
  });


  const titleText = new Konva.Text({
    name: 'titleText',
    x: 6,
    y: 2,
    width: textWidth,
    text: label,
    fontSize: 12,
    fontStyle: 'bold',
    ellipsis: true,
    listening: false,
  });


  background.on('click', (e) => {
    selectShape(background);
    e.cancelBubble = true;
  });


  background.on('transformend', () => {
    const newW = background.width() * background.scaleX();
    const newH = background.height() * background.scaleY();
    background.scale({ x: 1, y: 1 });
    background.width(newW);
    background.height(newH);


    titleBar.width(newW);
    titleText.width(textWidth);
    titleText.scale({ x: 1, y: 1 });


    group.getLayer()?.batchDraw();
  });

  group.add(background);
  group.add(titleBar);
  group.add(titleText);
  return group;
}
