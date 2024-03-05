
class Data_Processing {
    constructor() {
        this.raw_user_data = [];
    };

    load_CSV(filename) {
        const fs = require('fs');
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            // 这里可以处理CSV文本
            this.raw_user_data = data;
        });
    };

    format_Data() {
        var formatted_data = [];
        let lines = this.raw_user_data.split('\r\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].split(',');
            let formatted_user = {};
            let user_name = line[0].split(' ');
            if (["Mr", "Mrs", "Miss", "Ms", "Dr"].includes(user_name[0])) {
                formatted_user.title = user_name[0];
                user_name.shift();
            }
            formatted_user.first_name = user_name[0];
            user_name.shift();
            if (user_name.length > 1) {
                formatted_user.middle_name = user_name[0];
                user_name.shift();
            }
            else {
                formatted_user.middle_name = '';
            }
            formatted_user.surname = user_name[0];

            formatted_user.date_of_birth = line[1];

            formatted_user.age = line[2];

            formatted_user.email = line[3];

            formatted_data.push(formatted_user);
        }
        return JSON.stringify(formatted_data);
    }
};



const dataProcessor = new Data_Processing();
dataProcessor.load_CSV('Raw_User_Data.csv');
setTimeout(() => {
    console.log(dataProcessor.raw_user_data);
    const formattedData = dataProcessor.format_Data();
    console.log(formattedData);

}, 1000);


