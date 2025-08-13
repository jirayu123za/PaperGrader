import Konva from 'konva';



type BoxType = 'name' | 'id' | 'question' | string;

 function getColorsForType(t: BoxType) {
   switch (t) {
     case 'name':
       return {
         stroke: '#10B981',
         fill: 'rgba(16,185,129,0.10)',  
         titleFill: '#10B981',           
         text: '#F9F9F9',                
         dash: [] as number[],
       };
     case 'id':
       return {
         stroke: '#7C3AED',
         fill: 'rgba(124,58,237,0.10)',
         titleFill: '#7C3AED',
         text: '#F9F9F9',
         dash: [6, 4],                 
       };
     case 'question':
     default:
       return {
         stroke: '#2563EB',
         fill: 'rgba(37,99,235,0.10)',
         titleFill: '#2563EB',
         text: '#F9F9F9',
         dash: [] as number[],
       };
   }
 }

export function createBoundingBoxGroup(
  box: any,
  selectShape: (node: Konva.Node) => void
): Konva.Group {
  const x = box.point_x ?? box.bounding_box_point_x ?? 0;
  const y = box.point_y ?? box.bounding_box_point_y ?? 0;
  const width = box.width ?? box.bounding_box_width ?? 120;
  const height = box.height ?? box.bounding_box_height ?? 80;
  const label = box.question_title ?? 'Question';
  const type: BoxType = box.bounding_box_type ?? 'question';
  const point: number | undefined = box.question_point;
  const colors = getColorsForType(type);

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
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: 2,
  });


  const titleBar = new Konva.Rect({
    name: 'titleBar',
    x: 0,
    y: 0,
    width,
    height: titleBarHeight,
    fill: colors.titleFill,
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
    fill: colors.text,
    ellipsis: true,
    listening: false,
  });


  let pointText: Konva.Text | null = null;
  if (type === 'question' && typeof point === 'number') {
    pointText = new Konva.Text({
      name: 'pointText',
      x: Math.max(0, width - 64),
      y: 2,
      width: 60,
      align: 'right',
      text: `${point} pts`,
      fontSize: 12,
      fill: colors.text,
      listening: false,
    });
  }

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
    if (pointText) {
      pointText.x(Math.max(0, newW - 64));
      pointText.width(60);
    }


    group.getLayer()?.batchDraw();
  });

  group.add(background);
  group.add(titleBar);
  group.add(titleText);
  if (pointText) group.add(pointText);
  return group;
}
