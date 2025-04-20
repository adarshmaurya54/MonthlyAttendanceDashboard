import React, { useState } from "react";
import { LiaTimesSolid } from "react-icons/lia";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";



function InputType({
  value,
  extraClass,
  placeholder,
  onChange,
  name,
  required,
  inputType,
  labelText,
  labelFor,
  error,
  icon
}) {
  const [commingValue, setCommingValue] = useState(value);
  const [viewPassword, setViewPassword] = useState(false);

  return (
    <div className={`mb-1 w-full ${extraClass}`}>
      <label
        className="block text-gray-700 dark:text-gray-300 text-xs font-bold mb-2"
        htmlFor={labelFor}
      >
        {labelText}
      </label>
      <div className="relative group">
        <span className="absolute text-gray-500 top-1/2 left-2 -translate-y-1/2">
          {icon}
        </span>
        <input
          required={required}
          type={inputType === 'password' ? viewPassword ? 'text' : 'password' : inputType}
          id={labelFor}
          name={name}
          value={value}
          onChange={(e) => { setCommingValue(e.target.value); onChange(e.target.value) }}
          placeholder={placeholder}
          className={` w-full placeholder:text-sm md:placeholder:text-base  border-none pr-6 pl-8 py-3 rounded-2xl shadow-lg placeholder-gray-400 focus:outline focus:outline-2 outline-offset-2 ${error ? "border-red-500 focus:outline-red-500 bg-red-50" : "focus:outline-black "
            }`}
        />
        <span className={`absolute top-1/2 right-2 cursor-pointer -translate-y-1/2 ${commingValue ? "group-hover:block hidden" : "hidden"}`}>
          {inputType !== 'password' ?
            <LiaTimesSolid onClick={() => { onChange(''); setCommingValue('') }}  /> :
            viewPassword ? <FaRegEyeSlash onClick={() => setViewPassword(false)} /> : <FaRegEye onClick={() => setViewPassword(true)} />}

        </span>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default InputType;
