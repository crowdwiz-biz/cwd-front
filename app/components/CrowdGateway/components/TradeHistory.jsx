import React from "react";
import {RecentTransactions} from "../../Account/RecentTransactions";

//STYLES
import "../scss/cwdgateway-active.scss";

class TradeHistory extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="cwdgateway__hist-wrap">
                <RecentTransactions
                    accountsList={[this.props.currentAccount]}
                    compactView={false}
                    showMore={true}
                    fullHeight={true}
                    limit={10}
                    showFilters={false}
                    dashboard
                    multiFilter={[69, 70, 71, 72, 73, 74, 75, 76, 77, 78]}
                    gamezoneView={true}
                    shortMode={true}
                />
            </div>
        );
    }
}

export default TradeHistory;
