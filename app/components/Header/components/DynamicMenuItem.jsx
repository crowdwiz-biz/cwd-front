import React from "react";
import Translate from "react-translate-component";
import NewIcon from "../../NewIcon/NewIcon";
import {Link} from "react-router-dom";

import "../scss/breadcrumbs.scss";

class DynamicMenuItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let active = this.props.active;
        let dynamicMenuItem;

        // PROOF OF CROWD
        if (active.indexOf("/proof-of-crowd") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_proof_of_crowd"}
                        />
                        <span>Proof of Crowd</span>
                    </span>
                </div>
            );
        }

        // GAMEZONE
        if (active.indexOf("/gamezone") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_gamezone"}
                        />
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.gamezone.gamezone_header"
                        />
                    </span>
                </div>
            );
        }
        if (active.indexOf("/matrix-game") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/gamezone" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_gamezone"}
                        />
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.gamezone.gamezone_header"
                        />
                    </Link>
                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.gamezone.breadcrumbs_matrix"
                        />
                    </span>
                </div>
            );
        }
        if (active.indexOf("/scoop") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/gamezone" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_gamezone"}
                        />
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.gamezone.gamezone_header"
                        />
                    </Link>
                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.gamezone.breadcrumbs_scoop"
                        />
                    </span>
                </div>
            );
        }
        if (active.indexOf("/scoop/item-") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/gamezone" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_gamezone"}
                        />
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.gamezone.gamezone_header"
                        />
                    </Link>
                    <Link to="/gamezone/scoop" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs_arrow"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"header_breadcrumbs_arrow"}
                        />
                        <span className="breadcrumbs__item">
                            <Translate
                                className="breadcrumbs__text"
                                component="span"
                                content="account.gamezone.breadcrumbs_scoop"
                            />
                        </span>
                    </Link>
                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.gamezone.breadcrumbs_scoop_item"
                        />
                    </span>
                </div>
            );
        }

        if (active.indexOf("/heads-or-tails") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/gamezone" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_gamezone"}
                        />
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.gamezone.gamezone_header"
                        />
                    </Link>
                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.gamezone.breadcrumbs_heads_or_tails"
                        />
                    </span>
                </div>
            );
        }

        // CROWDMARKET
        if (active.indexOf("/crowdmarket") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_crowdmarket"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="crowdmarket.crowdmarket_header"
                        />
                    </span>
                </div>
            );
        }

        // CROWD ADS
        if (active.indexOf("/ads-board") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/crowdmarket" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_crowdmarket"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="crowdmarket.crowdmarket_header"
                        />
                    </Link>

                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="crowdmarket.crowd-ads"
                        />
                    </span>
                </div>
            );
        }

        // FINANCE DASHBOARD
        if (active.indexOf("/finance-dashboard") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_finance"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            content="header.finance"
                        />
                    </span>
                </div>
            );
        }

        // DEX
        if (active.indexOf("/gateway/dex") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/finance-dashboard" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_finance"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="header.finance"
                        />
                    </Link>
                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <span>CWDex</span>
                </div>
            );
        }

        // BTC
        if (active.indexOf("/btc") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/finance-dashboard" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_finance"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="header.finance"
                        />
                    </Link>

                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <Translate
                        className="breadcrumbs__text"
                        component="span"
                        content="cwdgateway.index.btc"
                    />
                </div>
            );
        }

        // STAKING
        if (active.indexOf("/poc_staking") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/finance-dashboard" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_finance"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="header.finance"
                        />
                    </Link>

                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <Translate
                        className="breadcrumbs__text"
                        component="span"
                        content="header.invest"
                    />
                </div>
            );
        }

        // PLEDGE OFFERS
        if (active.indexOf("/pledge-offer") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/finance-dashboard" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_finance"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="header.finance"
                        />
                    </Link>

                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <Translate
                        className="breadcrumbs__text"
                        component="span"
                        content="header.pledge_offer"
                    />
                </div>
            );
        }

        // PORTFOLIO
        if (active.indexOf("/portfolio") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/finance-dashboard" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_finance"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="header.finance"
                        />
                    </Link>

                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <Translate
                        className="breadcrumbs__text"
                        component="span"
                        content="account.portfolio"
                    />
                </div>
            );
        }

        //MARKETS DASHBOARRD
        if (active.indexOf("/markets-dashboard") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_exchange"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="header.exchange"
                        />
                    </span>
                </div>
            );
        }

        if (active.indexOf("/market/GCWD_CWD") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/markets-dashboard" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_exchange"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="header.exchange"
                        />
                    </Link>

                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <span>GCWD - CWD</span>
                </div>
            );
        }
        if (active.indexOf("/market/MGCWD_CWD") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/markets-dashboard" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_exchange"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="header.exchange"
                        />
                    </Link>

                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <span>MGCWD - CWD</span>
                </div>
            );
        }
        if (active.indexOf("/market/GCWD_MGCWD") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/markets-dashboard" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_exchange"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="header.exchange"
                        />
                    </Link>

                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <span>GCWD - MGCWD</span>
                </div>
            );
        }
        if (active.indexOf("/market/CROWD.BTC_CWD") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/markets-dashboard" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_exchange"}
                        />
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="header.exchange"
                        />
                    </Link>

                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <span>MGCWD - CWD</span>
                </div>
            );
        }

        //  VESTING
        if (active.indexOf("/vesting") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_vesting"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.vesting.vesting_title"
                        />
                    </span>
                </div>
            );
        }

        // STRUCTURE
        if (active.indexOf("/structure") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_structure"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.structure.structure_header"
                        />
                    </span>
                </div>
            );
        }

        // VOTING
        if (active.indexOf("/voting") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_voting"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.voting"
                        />
                    </span>
                </div>
            );
        }

        // ACTIVITY
        if (active.indexOf("account") !== -1) {
            var str = "/account/";
            var url = active.substring(str.length, active.length);

            if (url.search(/\//) == -1) {
                dynamicMenuItem = (
                    <div className="breadcrumbs__inner">
                        <span className="breadcrumbs__item breadcrumbs__item--active">
                            <NewIcon
                                iconClass={"breadcrumbs__icon"}
                                iconWidth={24}
                                iconHeight={24}
                                iconName={"left-menu_activity"}
                            />

                            <Translate
                                className="breadcrumbs__text"
                                component="span"
                                content="account.activity"
                            />
                        </span>
                    </div>
                );
            }
        }

        //EXPLORER
        if (active.indexOf("/explorer") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_explorer"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.explorer"
                        />
                    </span>
                </div>
            );
        }

        // WITNESES
        if (active.indexOf("/witnesses") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <Link to="/explorer" className="breadcrumbs__item">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_explorer"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.explorer"
                        />
                    </Link>

                    <NewIcon
                        iconClass={"breadcrumbs_arrow"}
                        iconWidth={24}
                        iconHeight={24}
                        iconName={"header_breadcrumbs_arrow"}
                    />
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="explorer.witnesses.title"
                        />
                    </span>
                </div>
            );
        }

        // WHITELIST
        if (active.indexOf("/whitelist") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_whitelist"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.whitelist.title"
                        />
                    </span>
                </div>
            );
        }

        //PERMISSIONS
        if (active.indexOf("/permissions") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_permissions"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="account.permissions"
                        />
                    </span>
                </div>
            );
        }

        // SETTINGS
        if (active.indexOf("settings") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_settings"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="header.settings"
                        />
                    </span>
                </div>
            );
        }

        // ASSETS
        if (active.indexOf("/assets") !== -1) {
            dynamicMenuItem = (
                <div className="breadcrumbs__inner">
                    <span className="breadcrumbs__item breadcrumbs__item--active">
                        <NewIcon
                            iconClass={"breadcrumbs__icon"}
                            iconWidth={24}
                            iconHeight={24}
                            iconName={"left-menu_assets"}
                        />

                        <Translate
                            className="breadcrumbs__text"
                            component="span"
                            content="explorer.assets.title"
                        />
                    </span>
                </div>
            );
        }

        // if (active.indexOf("/signedmessages") !== -1) {
        //     dynamicMenuItem = (
        //         <span
        //             style={{flexFlow: "row"}}
        //             className={cnames({
        //                 active: active.indexOf("/signedmessages") !== -1
        //             })}
        //         >
        // <NewIcon
        //     iconClass={"breadcrumbs__icon"}
        //     iconWidth={24}
        //     iconHeight={24}
        //     iconName={"mail"}
        // />
        //             <Translate
        //                 className="column-hide-small"
        //                 component="span"
        //                 content="account.signedmessages.menuitem"
        //             />
        //         </span>
        //     );
        // }

        return <div className="breadcrumbs__wrap">{dynamicMenuItem}</div>;
    }
}

export default DynamicMenuItem;
