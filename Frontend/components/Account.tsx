import { useState } from 'react';
import { FaUserCircle, FaQuestionCircle, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import { useFetchLogout } from '../hooks/useFetchLogout'; // นำเข้า useFetchLogout

interface AccountMenuProps {
  isCollapsed: boolean;
}

export default function AccountMenu({ isCollapsed }: AccountMenuProps) {
  const [accountOpened, setAccountOpened] = useState(false);
  const { refetch: logout } = useFetchLogout(); // ใช้ refetch เพื่อเรียกฟังก์ชัน logout

  return (
    <div className={`absolute bottom-0 left-0 w-full ${isCollapsed ? 'flex justify-center' : ''}`}>
      <button
        onClick={() => setAccountOpened(!accountOpened)}
        className={`w-full flex ${isCollapsed ? 'justify-center' : 'items-center justify-between'} p-2 border rounded ${accountOpened ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-200`}
      >
        {/* ไอคอนจะอยู่ตรงกลางเมื่อ Sidebar หุบ */}
        <FaUserCircle size={18} />
        {/* จะแสดงคำว่า Account และลูกศรเฉพาะเมื่อ Sidebar เปิด */}
        {!isCollapsed && (
          <>
            <span className="flex-grow text-left ml-2">Account</span>
            <span>{accountOpened ? '▴' : '▾'}</span>
          </>
        )}
      </button>

      {/* เมนูจะแสดงขึ้นไม่ว่าจะ Sidebar หุบหรือไม่ */}
      {accountOpened && (
        <div
          className={`absolute ${isCollapsed ? 'left-0 bottom-full mb-2' : 'bottom-full mb-2'} 
          bg-white border rounded shadow-lg ${isCollapsed ? 'w-40' : 'w-full'}`}
        >
          <button className="w-full text-left p-2 flex items-center hover:bg-gray-100">
            <FaQuestionCircle size={16} className="mr-2" />
            Help {/* แสดงข้อความเสมอ ไม่ขึ้นกับ isCollapsed */}
          </button>
          <button className="w-full text-left p-2 flex items-center hover:bg-gray-100">
            <FaEdit size={16} className="mr-2" />
            Edit Account {/* แสดงข้อความเสมอ */}
          </button>
          <button
            onClick={() => logout()}  // เรียกใช้งาน logout เมื่อคลิกปุ่ม Log Out
            className="w-full text-left p-2 flex items-center hover:bg-gray-100 text-red-500"
          >
            <FaSignOutAlt size={16} className="mr-2" />
            Log Out {/* แสดงข้อความเสมอ */}
          </button>
        </div>
      )}
    </div>
  );
}
