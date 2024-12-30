// config.js
import { @Vigilant @SliderProperty @SwitchProperty @NumberProperty @TextProperty @ButtonProperty @SliderProperty @CheckboxProperty @SelectorProperty} from 'Vigilance';

@Vigilant("ActionStealer", "ActionStealer")
class Settings {
    @SwitchProperty({
        name: 'Action Stealer',
        description: 'Automatically log action items in chat.',
        category: 'Config'
    })
    actionStealer = true;

    @SelectorProperty({
        name: 'Action Stealer Condition',
        description: 'Only log action items if the selected condition is met.',
        category: 'Config',
        options: ['Always', 'In Creative', 'On FreeBuild (Detected by House Name)']
    })
    condition = 1;

    @SwitchProperty({
        name: 'Ignore Owned Items',
        description: "Don\'t log action items if they are already in your inventory.",
        category: 'Config',
    })
    dontRecordOwned = true;

    constructor() {
        this.initialize(this);
        this.addDependency("Action Stealer Condition", "Action Stealer");
        this.addDependency("Ignore Owned Items", "Action Stealer");
    }
}

export default new Settings();