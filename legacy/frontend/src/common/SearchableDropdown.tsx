// Copyright © 2024 Navarrotech

import { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconProp } from "@fortawesome/fontawesome-svg-core"
import { faSearch } from "@fortawesome/free-solid-svg-icons"

type Option = {
  id?: string
  icon?: IconProp
  key: string
  value: string
  text: string
}

type Props = {
  options: string[] | Option[]
  onSelect: (value: string) => void
  isMulti?: boolean
  value?: string[] // Prop to accept value from parent
  children: React.ReactNode // Dropdown trigger content
}

export default function SearchableDropdown({ options, onSelect, isMulti, value = [], children }: Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedValues, setSelectedValues] = useState<string[]>(value)
  const [isActive, setIsActive] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSelectedValues(value)
  }, [value])

  useEffect(() => {
    searchRef.current?.focus()
  }, [isActive])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleSelect = (val: string) => {
    if (isMulti) {
      setSelectedValues((prevValues) =>
        prevValues.includes(val)
          ? prevValues.filter((value) => value !== val)
          : [...prevValues, val]
      )
      onSelect(val)
    } else {
      setSelectedValues([val])
      onSelect(val)
      setIsActive(false) // Close the dropdown on single select
    }
  }

  const handleDropdownClick = () => {
    setIsActive(!isActive)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsActive(false)
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  const filteredOptions = options.filter((option) =>
    (typeof option === "string" ? option : option.text)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`dropdown ${isActive ? "is-active" : ""}`} ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={handleDropdownClick}>
        { children }
      </div>
      <div className="dropdown-menu">
        <div className="dropdown-content">
          <div className="dropdown-item">
            <div className="field">
              <div className="control has-icons-left">
                <input
                  ref={searchRef}
                  className="input is-small"
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <span className="icon is-left">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
              </div>
            </div>
          </div>
          <div className="dropdown-wrapper">
            {filteredOptions.map((option) => {
              const key = typeof option === "string" ? option : option.key
              const val = typeof option === "string" ? option : option.value
              const text = typeof option === "string" ? option : option.text
              const icon = typeof option !== "string" && option.icon ? option.icon : null

              return (
                <a
                  className={`dropdown-item is-clickable ${value.includes(val) ? "is-active" : ""}`}
                  key={key}
                  onClick={() => handleSelect(val)}
                >
                  {isMulti && (
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(val)}
                      onChange={() => handleSelect(val)}
                    />
                  )}
                  {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
                  {text}
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
