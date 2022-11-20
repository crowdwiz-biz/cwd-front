import React from "react";
import { Pagination } from "antd";
import TransitionWrapper from "../Utility/TransitionWrapper";
import Translate from "react-translate-component";

export default class PaginatedList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page: 1,
            pageSize: props.pageSize
        };
    }

    static defaultProps = {
        rows: [],
        pageSize: 25,
        label: "utility.total_x_items",
        className: "table",
        extraRow: null,
        style: { paddingBottom: "1rem" }
    };

    onChange(page, pageSize) {
        this.setState({ page, pageSize });
    }

    itemRender(current, type, originalElement) {
        if (type === "prev") {
            return (
                <div className="pagination__nav-wrapper">
                    <div className="pagination__arrow-wrapper">
                        <a className="pagination__nav--mob pagination__arrow">
                            <Translate
                                className="pagination__nav--desc"
                                content="pagination.page-prew"
                            />
                        </a>
                    </div>
                </div>
            );
        }
        if (type === "next") {
            return (
                <div className="pagination__nav-wrapper">
                    <div className="pagination__arrow-wrapper">
                        <a className="pagination__nav--mob pagination__arrow pagination__arrow--next">
                            <Translate
                                className="pagination__nav--desc"
                                content="pagination.page-next"
                            />
                        </a>
                    </div>
                </div>
            );
        }
        return originalElement;
    }

    render() {
        const { page, pageSize } = this.state;
        const { header, rows, extraRow } = this.props;
        const total = rows.length;

        let currentRows = getRows(page, pageSize);

        function getRows(page, pageSize) {
            let r = [];
            for (
                var i = (page - 1) * pageSize;
                i < Math.min(total, page * pageSize);
                i++
            ) {
                r.push(rows[i]);
            }
            return r;
        }

        /* Paginated too far or filtered out options without changing the page */
        if (!currentRows.length && total) {
            currentRows = getRows(1, pageSize);
        }

        return (
            <div className="table__wrap">
                <div className={this.props.className}>
                    {header ? <div>{header}</div> : null}
                    <TransitionWrapper
                        component="div"
                        className={this.props.paginatedWrap}
                        transitionName="newrow"
                    >
                        {currentRows}
                        {extraRow}
                    </TransitionWrapper>
                </div>

                {total > pageSize ?
                    <div className="pagination__wrap">
                        <Pagination
                            total={total}
                            pageSize={pageSize}
                            current={page}
                            onChange={this.onChange.bind(this)}
                            itemRender={this.itemRender}
                        />
                    </div> : null}

                {this.props.children}
            </div>
        );
    }
}
