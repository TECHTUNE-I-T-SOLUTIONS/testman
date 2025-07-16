type DropdownProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

const DropdownFilter: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="border p-2 rounded text-gray-800 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
  >
    <option value="">{`All ${label}`}</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

export default DropdownFilter;
