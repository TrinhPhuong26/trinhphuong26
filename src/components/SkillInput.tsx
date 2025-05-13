"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

interface SkillInputProps {
  value: string[];
  onChange: (newValue: string[]) => void;
  placeholder?: string;
}

export default function SkillInput({
  value = [],
  onChange,
  placeholder = "Nhập kỹ năng và nhấn Enter...",
}: SkillInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      
      // Kiểm tra nếu kỹ năng đã tồn tại
      if (!value.includes(inputValue.trim())) {
        const newValue = [...value, inputValue.trim()];
        onChange(newValue);
      }
      
      setInputValue("");
    }
  };

  const removeSkill = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {value.map((skill, index) => (
          <Badge key={index} variant="secondary" className="gap-1">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="ml-1 rounded-full p-0.5 hover:bg-gray-200 focus:outline-none"
              aria-label={`Xóa ${skill}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
} 