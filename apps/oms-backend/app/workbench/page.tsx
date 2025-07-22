"use client";
import { FC, memo } from "react";
import UnAnswerList from "./components/unAnswerList";
import ButlerWorkerList from "./components/butlerWorkerList";
import WorkOrderList from "./components/workOrderList";

const Component: FC = () => {
  return (
    <div className="flex h-[calc(100vh-160px)]">
      <div>
        <div className="h-[calc(50%-10px)] rounded-lg">
          <UnAnswerList />
        </div>
        <div className="h-[calc(50%-10px)] mt-[20px] rounded-lg">
          <WorkOrderList />
        </div>
      </div>
      <div className="ml-[10px] flex-1">
        <ButlerWorkerList />
      </div>
    </div>
  );
};

const WorkBench = memo(Component);
export default WorkBench;
