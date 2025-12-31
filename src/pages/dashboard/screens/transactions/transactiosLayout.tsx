import React  from "react";
import AllTransactions from "./allTransactions";

const TransactionsLayout: React.FC = () => {



  return (
    <main>
      <div className="py-1 px-6 mt-10">
        <div className="flex px-4 justify-between mb-6 items-center">
          <h1 className="text-[18px] text-[#667085] font-[700]">Transactions</h1>        
        </div>
        <AllTransactions />
      </div>
    </main>
  );
};

export default TransactionsLayout;
