import { composeComponentTestUtils, getSpecWrapper } from '~/testUtils';
import CheckboxElement, {
    boxIco,
    CheckboxElementProps,
    checkboxSpecId,
    checkedBoxIco,
    descSpecId,
    titleSpecId
} from '~/components/form/checkbox/CheckboxElement';

const baseProps: CheckboxElementProps = {
    name: 'Checkbox',
    checked: false
};

const { setup, spyOn } = composeComponentTestUtils(CheckboxElement, baseProps);

describe(CheckboxElement.name, () => {
    it('should render a checkbox element with title, description', () => {
        const setStateSpy = spyOn('setState');
        const { wrapper, props } = setup(true, {
            $merge: {
                title: 'Checkbox',
                description: 'All Destinations',
                labelClassName: 'label',
                checkboxClassName: 'checkbox',
                onChange: jest.fn()
            }
        });

        expect(getSpecWrapper(wrapper, checkboxSpecId).hasClass(boxIco)).toBeTruthy();
        expect(getSpecWrapper(wrapper, titleSpecId).exists()).toBeTruthy();
        expect(getSpecWrapper(wrapper, descSpecId).hasClass('description')).toBeTruthy();
        expect(wrapper).toMatchSnapshot('unchecked');

        // Check box
        wrapper.find('label').prop('onClick')();
        wrapper.update();

        expect(setStateSpy).toHaveBeenCalledTimes(1);
        expect(setStateSpy).toHaveBeenCalledWith({ checked: !props.checked }, expect.any(Function));
        expect(props.onChange).toHaveBeenCalledTimes(1);
        expect(getSpecWrapper(wrapper, checkboxSpecId).hasClass(checkedBoxIco)).toBeTruthy();
        expect(wrapper).toMatchSnapshot();

        // Remove title
        wrapper.setProps({
            title: '',
            description: 'Continue when there is no response'
        });

        expect(getSpecWrapper(wrapper, descSpecId).hasClass('descriptionSolo')).toBeTruthy();
        expect(wrapper).toMatchSnapshot();

        setStateSpy.mockRestore();
    });
});