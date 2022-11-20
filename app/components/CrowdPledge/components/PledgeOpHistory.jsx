import React from "react";
import {RecentTransactions} from "../../Account/RecentTransactions";

//STYLES
import "../scss/pledge-offer.scss";

class PledgeOpHistory extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="pledge-common__hist-wrap">
                <RecentTransactions
                    accountsList={[this.props.currentAccount]}
                    compactView={false}
                    showMore={true}
                    fullHeight={true}
                    limit={10}
                    showFilters={false}
                    dashboard
                    multiFilter={[86, 87, 88, 89, 90, 91]}
                    gamezoneView={true}
                    shortMode={true}
                />
            </div>
        );
    }
}

export default PledgeOpHistory;
