import { useState } from 'react';
import { FaBarsStaggered } from 'react-icons/fa6'; // Import FaBarsStaggered จาก react-icons

export default function LeftProcess() {
  const [isCollapsed, setIsCollapsed] = useState(false); // สถานะสำหรับการหุบ/ขยายเมนู
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['Edit Outline']); // เก็บสถานะของตัวเลือกที่ผ่านแล้ว

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed); // เปลี่ยนสถานะการหุบ/ขยายเมนู
  };

  const toggleOption = (option: string) => {
    setSelectedOptions((prevOptions) =>
      prevOptions.includes(option)
        ? prevOptions.filter((opt) => opt !== option)
        : [...prevOptions, option]
    );
  };

  return (
    <div className={`h-screen flex flex-col justify-between border-r border-gray-300 ${isCollapsed ? 'w-16 p-4' : 'w-64 p-6'} bg-gray-100`}>
      {/* ส่วนของโลโก้และไอคอนเมนูด้านบน */}
      <div className="flex items-center justify-between mb-4">
        <div className={`${isCollapsed ? 'hidden' : 'block'} bg-gray-200 p-2 rounded`}> {/* กรอบโลโก้ที่แสดงเมื่อเมนูขยาย */}
          Logo
        </div>
        <button onClick={toggleCollapse} className="text-sm">
          <FaBarsStaggered
            size={24}
            className={`transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`} // ใช้ transform เพื่อหมุนไอคอน
          />
        </button>
      </div>

      {/* เนื้อหาเมนู */}
      <div className={`flex-grow ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {/* แสดงวงกลมเช็คถูกแม้เมนูจะถูกหุบ */}
        <div className={`flex flex-col space-y-2 ${isCollapsed ? 'items-center' : ''}`}>
          {['Edit Outline', 'Create rubric', 'Manage Scans', 'Manage Submissions', 'Grade Submissions'].map(option => (
            <button
              key={option}
              onClick={() => toggleOption(option)}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4 py-2'} rounded ${selectedOptions.includes(option) ? 'bg-blue-100 font-bold' : ''}`}
            >
              {selectedOptions.includes(option) ? '✔️' : '○'} {isCollapsed ? '' : option}
            </button>
          ))}
        </div>
      </div>

      {/* เมนูด้านล่าง */}
      <div className={`flex flex-col space-y-2 mb-4 ${isCollapsed ? 'items-center' : ''}`}>
        <button className="flex items-center px-2 py-1 text-gray-700">
          🔄 {isCollapsed ? '' : 'Regrade Requests'}
        </button>
        <button className="flex items-center px-2 py-1 text-gray-700">
          📊 {isCollapsed ? '' : 'Statistics'}
        </button>
        <button className="flex items-center px-2 py-1 text-gray-700">
          ⚙️ {isCollapsed ? '' : 'Settings'}
        </button>
      </div>
      
      {/* ส่วนล่าง */}
      <div className="text-center">
        <button className="text-gray-700">{isCollapsed ? '👤' : 'Account ▼'}</button>
      </div>
    </div>
  );
}
