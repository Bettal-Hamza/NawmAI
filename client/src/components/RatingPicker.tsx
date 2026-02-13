import React, { type ReactNode } from 'react';
import { HiOutlineFaceSmile } from 'react-icons/hi2';
import { FiMeh, FiFrown, FiSmile } from 'react-icons/fi';

interface RatingPickerProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  icons?: ReactNode[];
}

const defaultIcons: ReactNode[] = [
  <FiFrown className="text-xl" />,
  <FiMeh className="text-xl" />,
  <FiMeh className="text-xl" />,
  <FiSmile className="text-xl" />,
  <HiOutlineFaceSmile className="text-xl" />,
];

const RatingPicker: React.FC<RatingPickerProps> = ({
  value,
  onChange,
  label,
  icons = defaultIcons,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer
              ${value === num
                ? 'bg-brand-400 scale-110 shadow-lg shadow-brand-400/25 text-black'
                : 'bg-navy-700 hover:bg-navy-600 text-slate-300'
              }`}
          >
            {icons[num - 1]}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-1">{value}/5</p>
    </div>
  );
};

export default RatingPicker;
