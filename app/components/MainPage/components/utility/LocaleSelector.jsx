import React from "react";
import counterpart from "counterpart";
import SettingsStore from "stores/SettingsStore";
import IntlActions from "actions/IntlActions";
import SettingsActions from "actions/SettingsActions";
import NewIcon from "../../../NewIcon/NewIcon";

class LocaleSelector extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentLocale: SettingsStore.getState().settings.get("locale"),
            isSelectOpened: false
        };
    }

    openSelect() {
        let isSelectOpened = this.state.isSelectOpened;

        this.setState({
            isSelectOpened: !isSelectOpened
        });
    }

    handleLanguageSelect(lang) {
        IntlActions.switchLocale(lang);
        SettingsActions.changeSetting({
            setting: "locale",
            value: lang
        });

        this.setState({
            currentLocale: lang,
            isSelectOpened: false
        });
    }

    render() {
        let langImg = {};
        let isSelectOpened = this.state.isSelectOpened;
        let currentLocale = this.state.currentLocale;
        let locales = SettingsStore.getState().defaults.locale;

        locales.map(
            locale =>
                (langImg[
                    locale
                ] = require("assets/svg-images/svg-common/main-page/locale/lang_" +
                    locale +
                    ".svg"))
        );

        let containerWidth = window.innerWidth;

        return (
            <div className="locale-selector__box">
                <div
                    className="locale-selector__item locale-selector__item--closed"
                    onClick={this.openSelect.bind(this)}
                >
                    <img
                        className="locale-selector__img"
                        src={langImg[currentLocale]}
                        alt=""
                    />
                    {containerWidth > 767 ? (
                        <span className="locale-selector__text">
                            {counterpart.translate(
                                "languages." + currentLocale
                            )}
                        </span>
                    ) : null}

                    {!isSelectOpened ? (
                        <NewIcon
                            iconClass={"locale-selector__drop-down-btn"}
                            iconWidth={9}
                            iconHeight={9}
                            iconName={"up_down_arrow"}
                        />
                    ) : null}
                </div>

                {isSelectOpened ? (
                    <ul className="locale-selector__list" value={currentLocale}>
                        {locales.map(locale => (
                            <li
                                key={locale}
                                value={locale}
                                onClick={this.handleLanguageSelect.bind(
                                    this,
                                    locale
                                )}
                                className="locale-selector__item"
                            >
                                <img
                                    className="locale-selector__img"
                                    src={langImg[locale]}
                                    alt=""
                                />
                                <span className="locale-selector__text">
                                    {counterpart.translate(
                                        "languages." + locale
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        );
    }
}

export default LocaleSelector;
