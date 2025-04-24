'use client';

import React, { useState } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';

export default function KonvaCanvas(props: any) {
  const [KonvaComponents] = useState<any>(null);
  
  if (!KonvaComponents) return null;

  const { Stage, Layer, Transformer } = KonvaComponents;

  return (
    <Stage
      // onMouseDown={(e: KonvaEventObject<MouseEvent>) => {
      //   if (e.target === e.target.getStage()) {
      //     props.form.setFieldValue('selectedBoxId', null);
      //     props.transformerRef.current?.detach();
      //     props.transformerRef.current?.getLayer().batchDraw();
      //   }
      // }}
    >
      {/* <Layer>
        <Transformer ref={props.transformerRef} />
      </Layer> */}
    </Stage>
  );
}
