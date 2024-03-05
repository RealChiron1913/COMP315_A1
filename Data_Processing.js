const { time } = require('console');


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
            let rows = data.split('\n');
            for (let i = 1; i < rows.length; i++) {
                let row = rows[i].split(',');
                if (row.length === 1) {
                    continue;
                }
                this.raw_user_data.push(row);
            }
        });
    };

    format_Data() {
        let formatted_data = [];
        for (let i = 0; i < this.raw_user_data.length; i++) {
            let user = this.raw_user_data[i];
            let formatted_user = {};
            let user_data = user[0].split(" ");
            if (["Mr", "Mrs", "Miss", "Ms", "Dr"].includes(user_data[0])) {
                formatted_user.Title = user_data[0];
                user_data.shift();
            }
            formatted_user.First_Name = user_data[0];
            user_data.shift();
            if (user_data.length > 1) {
                formatted_user.Middle_Name = user_data[0];
                user_data.shift();
            }
            else {
                formatted_user.Middle_Name = "";
            }
            formatted_user.Surname = user_data[0];

            formatted_user.Date_of_birth = user[1];

            formatted_user.Age = user[2];

            formatted_user.Email = user[3];

            formatted_data.push(formatted_user);

        }
        return formatted_data;
    }
};

const dataProcessor = new Data_Processing();
dataProcessor.load_CSV('Raw_User_Data.csv');
setTimeout(() => {
    const formattedData = dataProcessor.format_Data();
    console.log(formattedData);

}, 1000);


