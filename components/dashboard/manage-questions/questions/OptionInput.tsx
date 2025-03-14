interface Option {
  text: string;
  isCorrect: boolean;
}

interface OptionInputProps {
  options: Option[];
  setOptions: (options: Option[]) => void;
}

export default function OptionInput({ options, setOptions }: OptionInputProps) {
  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, text: string, isCorrect: boolean) => {
    const newOptions = [...options];
    newOptions[index] = { text, isCorrect };
    setOptions(newOptions);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Options:</h3>
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="text"
              value={option.text}
              onChange={(e) =>
                updateOption(index, e.target.value, option.isCorrect)
              }
              className="flex-1 px-3 py-2 border text-gray-900 border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder={`Option ${index + 1}`}
            />
            <input
              type="checkbox"
              checked={option.isCorrect}
              onChange={(e) =>
                updateOption(index, option.text, e.target.checked)
              }
              className="h-5 w-5 text-purple-600 focus:ring-purple-500"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(index)}
                className="px-3 py-1 text-white bg-red-500 rounded-md hover:bg-red-600 transition"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addOption}
        className="mt-4 px-4 py-2 bg-purple-600 text-white font-medium rounded-md shadow-sm hover:bg-purple-700 transition duration-200"
      >
        + Add Option
      </button>
    </div>
  );
}
