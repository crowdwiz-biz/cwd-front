import React from "react";
import Translate from "react-translate-component";
import FooterSocialItem from "./utility/FooterSocialItem";
import FooterLinklItem from "./utility/FooterLinklItem";

class MainFooter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            socialItems: [
                {
                    img: "social-icons_instagram_icon",
                    url: "https://instagram.com/cwd.global.official"
                },
                {
                    img: "social-icons_telegram_icon",
                    url: "https://t.me/cwdglobal"
                }
            ],
            linkItems: [
                {
                    text: "link_docs",
                    url: "https://github.com/crowdwiz-biz/docs"
                },
                {
                    text: "link_dev",
                    url: "https://github.com/crowdwiz-biz"
                },
                {
                    text: "white_paper",
                    url: "https://github.com/crowdwiz-biz/whitepaper"
                },
                {
                    text: "audit",
                    url: "https://github.com/crowdwiz-biz/amalgama-security-audits"
                }
            ]
        };
    }
    render() {
        let socialItems = this.state.socialItems;
        let linkItems = this.state.linkItems;

        return (
            <footer className="mp-footer">
                <div className="mp-footer__inner">
                    <h2 className="mp-footer__title">cwd.global</h2>

                    <Translate
                        className="mp-common__description"
                        content="main_page.footer.description"
                    />
                    <ul className="mp-footer__social-list">
                        {socialItems.map((socialObj, index) => (
                            <FooterSocialItem
                                key={index}
                                socialData={socialObj}
                            />
                        ))}
                    </ul>

                    <ul className="mp-footer__link-container">
                        {linkItems.map((linklObj, index) => (
                            <FooterLinklItem key={index} linkData={linklObj} />
                        ))}
                    </ul>
                </div>
            </footer>
        );
    }
}

export default MainFooter;
