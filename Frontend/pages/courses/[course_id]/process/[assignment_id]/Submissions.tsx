import { useEffect, useState } from 'react';
import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import INSSubmissions from '../../../../../components/INS/INSProcess/INSSubmissions';

export default function Submissions() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="flex min-h-screen">
      <LeftProcess />
      <div className="flex-grow p-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <INSSubmissions
              onViewPDF={() => { }}
            />
          </>
        )}
      </div>
    </div>
  );
}
