import React from "react";
import Translate from "react-translate-component";
import { Link } from "react-router-dom";


class AccountLink extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let { link, text, accountName } = this.props;
        return (
            <Link className="address-card__link" to={`/account/${accountName}/` + link}>
                <Translate content={"address_book.account_card.links." + text} />
            </Link>
        );
    }
}

export default AccountLink;