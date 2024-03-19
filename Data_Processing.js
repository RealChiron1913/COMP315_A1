
class Data_Processing {
    constructor() {
        this.raw_user_data = '';
        this.formatted_user_data = [];
        this.cleaned_user_data = [];
    };

    load_CSV(filename) {
        const fs = require('fs');
        filename = `${filename}.csv`;
        try {
            const data = fs.readFileSync(filename, 'utf8');
            this.raw_user_data = data;
        } catch (err) {
            console.error('Error reading the CSV file:', err);
        }

    }

    format_data() {
        let lines = this.raw_user_data.split('\r\n');
        lines.forEach(line => {
            if (line === '') return; // Skip empty lines
            const [fullName, dateOfBirth, age, email] = line.split(',');
            let userParts = fullName.split(' ');
            let formatted_user = {};

            // Extracting title if exists
            if (userParts[0].match(/(Mr|Mrs|Miss|Ms|Dr)/)) {
                formatted_user.title = userParts.shift();
            }
            else formatted_user.title = '';

            formatted_user.first_name = userParts.shift();
            const surname = userParts.pop();
            formatted_user.middle_name = userParts.join(' ') || '';
            formatted_user.surname = surname;
            let date_of_birth = dateOfBirth;

            let ddMmYyRegex = /^(\d{2})\/(\d{2})\/(\d{2})$/; // DD/MM/YY
            let match = ddMmYyRegex.exec(dateOfBirth);
            if (match) {
                let year = parseInt(match[3], 10) < 24 ? `20${match[3]}` : `19${match[3]}`;
                date_of_birth = `${match[1]}/${match[2]}/${year}`;
            }
            let ddMonthYyyyRegex = /^(\d{2}) ([a-zA-Z]+) (\d{4})$/; // DD Month YYYY
            match = ddMonthYyyyRegex.exec(dateOfBirth);
            if (match) {
                let month = new Date(`${match[2]} 1`).getMonth() + 1;
                month = month < 10 ? `0${month}` : month;
                date_of_birth = `${match[1]}/${month}/${match[3]}`;
            }

            formatted_user.date_of_birth = date_of_birth;



            // formatted_user.age = calculated_age;
            if (isNaN(age)) {
                const numberMap = {
                    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4,
                    "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9,
                    "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13,
                    "fourteen": 14, "fifteen": 15, "sixteen": 16, "seventeen": 17,
                    "eighteen": 18, "nineteen": 19, "twenty": 20, "thirty": 30,
                    "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70,
                    "eighty": 80, "ninety": 90
                };
                let total = 0;
                let parts = age.split(/-| /);

                parts.forEach(part => {
                    if (numberMap.hasOwnProperty(part)) {
                        total += numberMap[part];
                    }
                });
                formatted_user.age = total;
            }
            else {
                formatted_user.age = parseInt(age, 10);
            }

            formatted_user.email = email;

            this.formatted_user_data.push(formatted_user);
        });
    }
    clean_data() {
        let formatted_data = this.formatted_user_data;
        //remove duplicate lines
        formatted_data = formatted_data.filter((user, index, self) =>
            index === self.findIndex((t) => (
                t.first_name === user.first_name && t.surname === user.surname && t.date_of_birth === user.date_of_birth
            ))
        );
        for (let i = 0; i < formatted_data.length; i++) {
            let title = formatted_data[i].title.replace('.', '');
            let first_name = formatted_data[i].first_name;
            let surname = formatted_data[i].surname;
            let middle_name = formatted_data[i].middle_name;
            let date_of_birth = formatted_data[i].date_of_birth;
            let age = formatted_data[i].age;
            let email = formatted_data[i].email;
            let email_first_name = email.split('@')[0].split('.')[0];
            let email_last_name = email.split('@')[0].split('.')[1];
            email = email_first_name + '.' + email_last_name + '@example.com';
            this.cleaned_user_data[i] = {};
            this.cleaned_user_data[i].title = title;
            this.cleaned_user_data[i].first_name = first_name;
            this.cleaned_user_data[i].middle_name = middle_name;
            this.cleaned_user_data[i].surname = surname;
            this.cleaned_user_data[i].date_of_birth = date_of_birth;
            this.cleaned_user_data[i].age = age;
            this.cleaned_user_data[i].email = email;
            if (first_name !== email_first_name || surname !== email_last_name) {
                if (first_name === '' || first_name === NaN || first_name === undefined || first_name === null)
                    this.cleaned_user_data[i].first_name = email_first_name;
                else
                    email_first_name = first_name;
                if (surname === '' || surname === NaN || surname === undefined || surname === null)
                    this.cleaned_user_data[i].surname = email_last_name;
                else
                    email_last_name = surname;

                this.cleaned_user_data[i].email = email_first_name + '.' + email_last_name + '@example.com';
            }
            let parts = date_of_birth.split('/');
            let date = `${parts[2]}-${parts[1]}-${parts[0]}`;
            let birthdate = new Date(date);
            let today = new Date('2024-02-26');
            let calculated_age = today.getFullYear() - birthdate.getFullYear();
            let m = today.getMonth() - birthdate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
                calculated_age--;
            }
            this.cleaned_user_data[i].age = calculated_age;

        }

            let email_count = {};
            for (let i = 0; i < this.cleaned_user_data.length; i++) {
                let email = this.cleaned_user_data[i].email;
                if (email_count.hasOwnProperty(email)) { // If the email already exists in the email_count object
                    email_count[email]++;
                }
                else {
                    email_count[email] = 0;
                }
            }
            for (let i = 0; i < this.cleaned_user_data.length; i++) {
                let email = this.cleaned_user_data[i].email;
                if (email_count[email] > 0) {
                    this.cleaned_user_data[i].email = this.cleaned_user_data[i].email.replace('@', `${email_count[email]}@`);
                    email_count[email]++;
                }
            }

    }

    most_common_surname() {
        let surname_count = {};
        for (let i = 0; i < this.cleaned_user_data.length; i++) {
            let surname = this.cleaned_user_data[i].surname;
            if (surname_count.hasOwnProperty(surname)) { // If the surname already exists in the surname_count object
                surname_count[surname]++;
            }
            else {
                surname_count[surname] = 0;
            }
        }
        let most_common_surname = [];
        let max_count = 0;
        for (let surname in surname_count) {
            if (surname_count[surname] > max_count) {
                max_count = surname_count[surname];
                most_common_surname = [surname];
            }
            else if (surname_count[surname] === max_count) {
                most_common_surname.push(surname);
            }
        }
        return most_common_surname;
    }

    average_age() {
        let total_age = 0;
        for (let i = 0; i < this.cleaned_user_data.length; i++) {
            total_age += this.cleaned_user_data[i].age;
        }
        // This should be a real number to 3 significant figures.
        let average_age = total_age / this.cleaned_user_data.length;
        return Number(average_age.toPrecision(3));

    }

    youngest_dr() {
        let youngest_dr = { age: Infinity };
        for (let i = 0; i < this.cleaned_user_data.length; i++) {
            if (this.cleaned_user_data[i].title === 'Dr' && this.cleaned_user_data[i].age < youngest_dr.age) {
                youngest_dr = this.cleaned_user_data[i];
            }
        }
        return youngest_dr;
    }

    most_common_month() {
        let month_count = {};
        for (let i = 0; i < this.cleaned_user_data.length; i++) {
            let month = this.cleaned_user_data[i].date_of_birth.split('/')[1];
            if (month_count.hasOwnProperty(month)) { // If the month already exists in the month_count object
                month_count[month]++;
            }
            else {
                month_count[month] = 0;
            }
        }
        let most_common_month = [];
        let max_count = 0;
        for (let month in month_count) {
            if (month_count[month] > max_count) {
                max_count = month_count[month];
                most_common_month = [month];
            }
            else if (month_count[month] === max_count) {
                most_common_month.push(month);
            }
        }
        return most_common_month;
    }
    percentage_titles() {
        let title_count = {};
        for (let i = 0; i < this.cleaned_user_data.length; i++) {
            let title = this.cleaned_user_data[i].title;
            if (title_count.hasOwnProperty(title)) { // If the title already exists in the title_count object
                title_count[title]++;
            }
            else {
                title_count[title] = 1;
            }
        }
        //sorted: Mr, Mrs, Miss, Ms, Dr, or left blank
        let percentage_titles = [];
        let total_titles = 0;
        for (let title in title_count) {
            total_titles += title_count[title];
        }
        percentage_titles.push(Math.round((title_count['Mr'] / total_titles) * 100));
        percentage_titles.push(Math.round((title_count['Mrs'] / total_titles) * 100));
        percentage_titles.push(Math.round((title_count['Miss'] / total_titles) * 100));
        percentage_titles.push(Math.round((title_count['Ms'] / total_titles) * 100));
        percentage_titles.push(Math.round((title_count['Dr'] / total_titles) * 100));
        percentage_titles.push(Math.round((title_count[''] / total_titles) * 100));
        
        return percentage_titles;
    }

    percentage_altered() {
        let altered_values = 0;
        for (let i = 0; i < this.formatted_user_data.length; i++) {
            if (i >= this.cleaned_user_data.length) {
                altered_values += 7;
                continue;
            }
            if (this.formatted_user_data[i].title !== this.cleaned_user_data[i].title) {
                altered_values++;
            }
            if (this.formatted_user_data[i].first_name !== this.cleaned_user_data[i].first_name) {
                altered_values++;
            }
            if (this.formatted_user_data[i].middle_name !== this.cleaned_user_data[i].middle_name) {
                altered_values++;
            }
            if (this.formatted_user_data[i].surname !== this.cleaned_user_data[i].surname) {
                altered_values++;
            }
            if (this.formatted_user_data[i].date_of_birth !== this.cleaned_user_data[i].date_of_birth) {
                altered_values++;
            }
            if (this.formatted_user_data[i].age !== this.cleaned_user_data[i].age) {
                altered_values++;
            }
            if (this.formatted_user_data[i].email !== this.cleaned_user_data[i].email) {
                altered_values++;
            }
        }
        let percentage_altered = (altered_values / (7 * this.formatted_user_data.length)) * 100;
        return Number(percentage_altered.toPrecision(3));
    }


};




// const data_processing = new Data_Processing();
// data_processing.load_CSV('Raw_User_Data');
// data_processing.format_data();
// data_processing.clean_data();
// console.log(data_processing.percentage_titles());