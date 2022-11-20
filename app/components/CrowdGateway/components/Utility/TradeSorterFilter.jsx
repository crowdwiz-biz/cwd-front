import React from "react";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import NewIcon from "../../../NewIcon/NewIcon";

//STYLES
import "./scss/sort-block.scss";
import "./scss/filter-block.scss";

class TradeSorterFilter extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let isSorted = this.props.isSorted;

        return (
            <div className="sort-block__wrap">
                {/* SORTER */}
                <div className="sort-block__inner">
                    <Translate
                        className="sort-block__label"
                        content="cwdgateway.sort-block.label"
                    />
                    <button
                        className={
                            isSorted
                                ? "sort-block__btn"
                                : "sort-block__btn sort-block__btn--active"
                        }
                        onClick={this.props.sortByExRate}
                    >
                        <Translate content="cwdgateway.sort-block.by_exchange_rate" />
                    </button>

                    <button
                        className={
                            !isSorted
                                ? "sort-block__btn"
                                : "sort-block__btn sort-block__btn--active"
                        }
                        onClick={this.props.sortByRating}
                    >
                        <Translate content="cwdgateway.sort-block.buy_ranking" />
                    </button>
                </div>

                {/* FILTER */}
                <div className="sort-block__inner">
                    <div className="filter-block__search-wrap">
                        <input
                            className="filter-block__field"
                            type="text"
                            name="tradeAdsFilter"
                            id="tradeAdsFilter"
                            placeholder={counterpart.translate(
                                "cwdgateway.sort-block.search_placeholder"
                            )}
                            onChange={this.props.filterBySearchValue}
                        />

                        <button
                            className="filter-block__search-btn"
                            onClick={this.props.showAllTrades}
                        >
                            <span className="filter-block__del-wrap">
                                <NewIcon
                                    iconWidth={16}
                                    iconHeight={20}
                                    iconName={"delete_btn"}
                                />
                            </span>

                            <Translate
                                className="filter-block__del-text"
                                content="cwdgateway.sort-block.show_all"
                            />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default TradeSorterFilter;
