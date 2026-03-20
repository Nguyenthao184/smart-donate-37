import { useMemo, useState } from "react";
import { FiAward, FiMonitor } from "react-icons/fi";
import "./styles.scss";

export default function Menu({
  items,
  value,
  defaultValue,
  onChange,
}) {
  const resolvedItems = useMemo(
    () =>
      items?.length
        ? items
        : [
            { key: "campaigns", label: "Chiến Dịch", icon: <FiAward size={22} /> },
            { key: "feed", label: "Bảng Tin", icon: <FiMonitor size={22} /> },
          ],
    [items]
  );

  const initialValue =
    defaultValue ?? resolvedItems[0]?.key ?? "campaigns";
  const [internalValue, setInternalValue] = useState(initialValue);
  const currentValue = value ?? internalValue;

  function handleSelect(nextKey) {
    if (value === undefined) setInternalValue(nextKey);
    onChange?.(nextKey);
  }

  return (
    <div className="app-menu full-bleed">
      <div className="app-menu__inner">
        <nav className="app-menu__tabs" aria-label="Menu">
          {resolvedItems.map((item) => {
            const isActive = item.key === currentValue;
            return (
              <button
                key={item.key}
                type="button"
                className={`app-menu__tab${isActive ? " is-active" : ""}`}
                onClick={() => handleSelect(item.key)}
              >
                <span className="app-menu__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="app-menu__label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

