import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Type } from '../../../config';
import { fakePropType } from '../../../config/ConfigProvider';
import { BroadcastMsg, FlowDefinition } from '../../../flowTypes';
import { Asset } from '../../../services/AssetService';
import Localization, { LocalizedObject } from '../../../services/Localization';
import { AppState, DispatchWithState } from '../../../store';
import { SendBroadcastFunc, updateSendBroadcastForm } from '../../../store/forms';
import { SendBroadcastFormState } from '../../../store/nodeEditor';
import * as styles from '../../actions/Action/Action.scss';
import OmniboxElement from '../../form/OmniboxElement';
import TextInputElement, { Count, HTMLTextElement } from '../../form/TextInputElement';
import { Language } from '../../LanguageSelector';
import { UpdateLocalizations } from '../../NodeEditor';
import * as broadcastStyles from './SendBroadcast.scss';
import { SendBroadcastFormHelper } from './SendBroadcastFormHelper';

export interface SendBroadcastFormStoreProps {
    language: Language;
    translating: boolean;
    typeConfig: Type;
    definition: FlowDefinition;
    localizations: LocalizedObject[];
    form: SendBroadcastFormState;
    updateSendBroadcastForm: SendBroadcastFunc;
}

export interface SendBroadcastFormPassedProps {
    action: BroadcastMsg;
    formHelper: SendBroadcastFormHelper;
    updateAction(action: BroadcastMsg): void;
    updateLocalizations: UpdateLocalizations;
    onBindWidget(ref: any): void;
}

export type SendBroadcastFormProps = SendBroadcastFormStoreProps & SendBroadcastFormPassedProps;

export class SendBroadcastForm extends React.Component<
    SendBroadcastFormProps,
    SendBroadcastFormState
> {
    public static contextTypes = {
        endpoints: fakePropType,
        assetService: fakePropType
    };

    constructor(props: SendBroadcastFormProps) {
        super(props);

        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public onValid(): void {
        // TODO: might be nice to generalize translatable forms into helpers?
        if (this.props.translating) {
            const translation = this.props.form.translatedText;

            if (translation) {
                this.props.updateLocalizations(this.props.language.iso, [
                    { uuid: this.props.action.uuid, translations: { text: [translation] } }
                ]);
            } else {
                this.props.updateLocalizations(this.props.language.iso, [
                    { uuid: this.props.action.uuid, translations: null }
                ]);
            }
        } else {
            const action = this.props.formHelper.stateToAction(this.props.form);
            this.props.updateAction(action);
        }
    }

    public handleRecipientsChanged(selected: Asset[]): void {
        this.props.updateSendBroadcastForm({ recipients: selected });
    }

    public handleMessageUpdate(event: React.ChangeEvent<HTMLTextElement>): void {
        if (this.props.translating) {
            this.props.updateSendBroadcastForm({ translatedText: event.currentTarget.value });
        } else {
            this.props.updateSendBroadcastForm({ text: event.currentTarget.value });
        }
    }

    public render(): JSX.Element {
        let text = '';
        let placeholder = '';
        let translation = null;
        let recipients = null;

        if (this.props.translating) {
            const { text: textToTrans } = this.props.action;

            translation = (
                <div data-spec="translation-container">
                    <div data-spec="text-to-translate" className={styles.translate_from}>
                        {textToTrans}
                    </div>
                </div>
            );

            placeholder = `${this.props.language.name} Translation`;

            if (this.props.localizations[0].isLocalized()) {
                ({ text } = this.props.localizations[0].getObject() as BroadcastMsg);
            }
        } else {
            ({ text } = this.props.form);

            recipients = (
                <OmniboxElement
                    data-spec="recipients"
                    ref={this.props.onBindWidget}
                    className={broadcastStyles.recipients}
                    name="Groups"
                    assets={this.context.assetService.getRecipients()}
                    selected={this.props.form.recipients}
                    add={true}
                    required={true}
                    onChange={this.handleRecipientsChanged}
                />
            );
        }

        return (
            <div>
                {translation}
                {recipients}
                <TextInputElement
                    ref={this.props.onBindWidget}
                    name="Message"
                    showLabel={false}
                    count={Count.SMS}
                    value={text}
                    placeholder={placeholder}
                    autocomplete={true}
                    onChange={this.handleMessageUpdate}
                    focus={true}
                    required={!this.props.translating}
                    textarea={true}
                />
            </div>
        );
    }
}

/* istanbul ignore next */
const mapStateToProps = ({
    flowContext: { definition, localizations },
    flowEditor: { editorUI: { language, translating } },
    nodeEditor: { typeConfig, form }
}: AppState) => ({
    language,
    translating,
    typeConfig,
    definition,
    localizations,
    form
});

/* istanbul ignore next */
const mapDispatchToProps = (dispatch: DispatchWithState) =>
    bindActionCreators({ updateSendBroadcastForm }, dispatch);

const ConnectedSendMsgForm = connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(
    SendBroadcastForm
);

export default ConnectedSendMsgForm;
