import LeftProcess from '../components/LeftProcess';
import UploadFile from '../components/UploadFile';

export default function UploadFilePage() {
  return (
    <div className="flex min-h-screen">
      {/* แถบเมนูทางซ้าย */}
      <LeftProcess />
      {/* ส่วนของการอัพโหลดไฟล์ */}
      <div className="flex-grow p-8">
        <h1 className="text-2xl font-bold">Process Name</h1>
        <UploadFile />
      </div>
    </div>
  );
}
