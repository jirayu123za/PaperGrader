import { useState } from 'react';
import { FaUserCircle, FaQuestionCircle, FaEdit, FaSignOutAlt } from 'react-icons/fa';

export default function AccountMenu() {
  const [accountOpened, setAccountOpened] = useState(false); // สำหรับจัดการการเปิด-ปิดเมนูบัญชี

  return (
    <div className="absolute bottom-0 left-0 w-full"> {/* ปรับให้ชิดซ้ายและขยายเต็มกว้าง */}
      <button
        onClick={() => setAccountOpened(!accountOpened)} 
        className={`w-full flex items-center justify-between p-2 border rounded ${accountOpened ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-200`}
      >
        <FaUserCircle size={18} style={{ marginRight: '8px' }} />
        <span className="flex-grow text-left">Account</span>
        <span>{accountOpened ? '▴' : '▾'}</span>
      </button>

      {/* แสดงเมนูบัญชีเมื่อถูกเปิด */}
      {accountOpened && (
        <div className="absolute bottom-full mb-2 bg-white border rounded shadow-lg w-full"> {/* ปรับให้เมนูขึ้นด้านบน */}
          <button className="w-full text-left p-2 flex items-center hover:bg-gray-100">
            <FaQuestionCircle size={16} className="mr-2" />
            Help
          </button>
          <button className="w-full text-left p-2 flex items-center hover:bg-gray-100">
            <FaEdit size={16} className="mr-2" />
            Edit Account
          </button>
          <button className="w-full text-left p-2 flex items-center hover:bg-gray-100 text-red-500">
            <FaSignOutAlt size={16} className="mr-2" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
