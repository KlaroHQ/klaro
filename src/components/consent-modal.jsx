import React, { useState } from 'react';
import { Close } from './icons';
import Services from './services';
import Purposes from './purposes';
import Text from './text';

export default class ConsentModal extends React.Component {
        
    constructor(props) {
        super(props);
        this.state = {
            collapsed: this.props.collapsed
        };
    }
        
    componentDidMount() {
        if(!this.props.config.mustConsent) {
            this.consentModalRef.focus();
        }
    }
    
    expandServices = () => {
        this.setState({ collapsed: false });
    };

    render() {
        const {
            hide,
            confirming,
            saveAndHide,
            acceptAndHide,
            declineAndHide,
            config,
            manager,
            lang,
            t,
        } = this.props;
        const { embedded } = config;
        const groupByPurpose =
            config.groupByPurpose !== undefined ? config.groupByPurpose : true;
        const { collapsed } = this.state;

        let closeLink;
        if (!config.mustConsent || manager.confirmed) {
            closeLink = (
                <button
                    title={t(['close'])}
                    aria-label={t(['close'])}
                    className="hide"
                    type="button"
                    onClick={hide}
                    tabIndex="0"
                    ref={(div) => {
                        this.consentModalRef = div;
                    }}
                >
                    <Close t={t} />
                </button>
            );
        }

        let declineButton;
        let acceptAllButton;
        let acceptButton;
        let customizeButton;

        if (!config.hideDeclineAll && !manager.confirmed) {
            declineButton = (
                <button
                    disabled={confirming}
                    className="cm-btn cm-btn-decline cm-btn-danger cn-decline"
                    type="button"
                    onClick={declineAndHide}
                >
                    {t(['decline'])}
                </button>
            );
        }
        
        if (!collapsed || manager.confirmed) {
            acceptButton = (
                <button
                    disabled={confirming}
                    className="cm-btn cm-btn-success cm-btn-info cm-btn-accept"
                    type="button"
                    onClick={saveAndHide}
                >
                    {t([manager.confirmed ? 'save' : 'acceptSelected'])}
                </button>
            );
        }
        
        if (collapsed && !manager.confirmed) {
            customizeButton = (
                <a
                    key="learnMoreLink"
                    className="cm-link cn-learn-more"
                    href="#"
                    onClick={this.expandServices}
                >
                    {t(['consentNotice', 'learnMore'])}
                </a>
            );
        }
        
        if (config.acceptAll) {
            acceptAllButton = (
                <button
                    disabled={confirming}
                    className="cm-btn cm-btn-success cm-btn-accept-all"
                    type="button"
                    onClick={acceptAndHide}
                >
                    {t(['acceptAll'])}
                </button>
            );
        }

        let ppUrl;
        // to do: deprecate and remove this (also, this is duplicated from the notice)
        if (config.privacyPolicy !== undefined) {
            if (typeof config.privacyPolicy === 'string')
                ppUrl = config.privacyPolicy;
            else if (typeof config.privacyPolicy === 'object') {
                ppUrl =
                    config.privacyPolicy[lang] || config.privacyPolicy.default;
            }
        } else {
            // this is the modern way
            ppUrl = t(['!', 'privacyPolicyUrl'], { lang: lang });
            if (ppUrl !== undefined) ppUrl = ppUrl.join('');
        }

        let ppLink;
        if (ppUrl !== undefined)
            ppLink = (
                <a key="ppLink" href={ppUrl} target="_blank" rel="noopener">
                    {t(['privacyPolicy', 'name'])}
                </a>
            );

        let servicesOrPurposes;

        if (groupByPurpose)
            servicesOrPurposes = (
                <Purposes t={t} config={config} manager={manager} lang={lang} />
            );
        else
            servicesOrPurposes = (
                <Services t={t} config={config} manager={manager} lang={lang} />
            );
        
        const innerModal = (
            <div className="cm-modal cm-klaro">
                <div className="cm-header">
                    {closeLink}
                    <h1 className="title">
                        <Text
                            config={config}
                            text={t(['consentModal', 'title'])}
                        />
                    </h1>
                    <p>
                        <Text
                            config={config}
                            text={[t(['consentModal', 'description'])].concat(
                                (ppLink &&
                                    [' '].concat(
                                        t(['privacyPolicy', 'text'], {
                                            privacyPolicy: ppLink,
                                        })
                                    )) ||
                                    []
                            )}
                        />
                    </p>
                </div>
                
                {(!collapsed || manager.confirmed) && (
                    <div className="cm-body">{servicesOrPurposes}</div>
                )}
                
                <div className="cm-footer">
                    <div className="cm-footer-buttons">
                        {declineButton}
                        {acceptButton}
                        {customizeButton}
                        {acceptAllButton}
                    </div>
                    {!config.disablePoweredBy && (
                        <p className="cm-powered-by">
                            <a
                                target="_blank"
                                href={
                                    config.poweredBy ||
                                    'https://kiprotect.com/klaro'
                                }   
                                rel="noopener"
                            >
                                {t(['poweredBy'])}
                            </a>
                        </p>
                    )}
                </div>
            </div>
        );
        
        if (embedded)
            return <div id="cookieScreen" className="cookie-modal cm-embedded">{innerModal}</div>;

        return (
            <div id="cookieScreen" className="cookie-modal">
                <div className="cm-bg" onClick={hide} />
                {innerModal}
            </div>
        );
    }
}
