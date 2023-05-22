import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";

export enum AlertType {
  Success = "success",
  Error = "error",
  Warning = "warning",
  Info = "info",
}

export interface AlertProps {
  type: AlertType;
  message: string;
}

export const Alert = ({ type, message }: AlertProps) => {
  const [icon, setIcon] = useState<JSX.Element | null>(null);

  useEffect(() => {
    switch (type) {
      case AlertType.Success:
        setIcon(<CheckCircleIcon className="w-6 h-6 text-green-400" />);
        break;
      case AlertType.Error:
        setIcon(<XCircleIcon className="w-6 h-6 text-red-400" />);
        break;
      case AlertType.Warning:
        setIcon(
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
        );
        break;
      case AlertType.Info:
        setIcon(<InformationCircleIcon className="w-6 h-6 text-blue-400" />);
        break;
    }
  }, [type]);

  return (
    <div className="rounded-md bg-white dark:bg-gray-800 shadow-lg p-2 m-2">
      <div className="flex">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
