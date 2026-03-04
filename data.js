// data.js
const themes = {
    'Level 1：人物': [
        { en: "成人", cn: "n.", pos: "An adult needs to drive the car.", sen: "小孩應該由成人陪同。", trans: "{ en: "Adult", cn: "成人", pos: "n.", sen: "An adult needs to drive the car.", trans: "小孩應該由成人陪同。" }," },
        { en: "天使", cn: "n.", pos: "The little girl looks like an angel.", sen: "你看起來像個美麗的天使。", trans: "{ en: "Angel", cn: "天使", pos: "n.", sen: "The little girl looks like an angel.", trans: "你看起來像個美麗的天使。" }," },
        { en: "嬰兒、寶貝", cn: "n.", pos: "The baby is sleeping now.", sen: "嬰兒正在床上睡覺。", trans: "{ en: "Baby", cn: "嬰兒、寶貝", pos: "n.", sen: "The baby is sleeping now.", trans: "嬰兒正在床上睡覺。" }," },
        { en: "男孩", cn: "n.", pos: "That boy is my classmate.", sen: "那個男孩是我的弟弟。", trans: "{ en: "Boy", cn: "男孩", pos: "n.", sen: "That boy is my classmate.", trans: "那個男孩是我的弟弟。" }," },
        { en: "小孩", cn: "n.", pos: "Every child likes to play games.", sen: "每個小孩都喜歡玩遊戲。", trans: "{ en: "Child", cn: "小孩", pos: "n.", sen: "Every child likes to play games.", trans: "每個小孩都喜歡玩遊戲。" }," },
        { en: "情侶、夫妻", cn: "n.", pos: "They are a happy couple.", sen: "他們是一對非常幸福的夫妻。", trans: "{ en: "Couple", cn: "情侶、夫妻", pos: "n.", sen: "They are a happy couple.", trans: "他們是一對非常幸福的夫妻。" }," },
        { en: "顧客", cn: "n.", pos: "The customer buys a toy in the shop.", sen: "顧客正在商店裡買食物。", trans: "{ en: "Customer", cn: "顧客", pos: "n.", sen: "The customer buys a toy in the shop.", trans: "顧客正在商店裡買食物。" }," },
        { en: "呆子", cn: "n.", pos: "Don't be a fool.", sen: "別當呆子，三思而後行。", trans: "{ en: "Fool", cn: "呆子", pos: "n.", sen: "Don't be a fool.", trans: "別當呆子，三思而後行。" }," },
        { en: "天才", cn: "n.", pos: "He is a genius at math.", sen: "愛因斯坦是一位偉大的天才。", trans: "{ en: "Genius", cn: "天才", pos: "n.", sen: "He is a genius at math.", trans: "愛因斯坦是一位偉大的天才。" }," },
        { en: "紳士", cn: "n.", pos: "My dad is a kind gentleman.", sen: "他是一位善良且有禮貌的紳士。", trans: "{ en: "Gentleman", cn: "紳士", pos: "n.", sen: "My dad is a kind gentleman.", trans: "他是一位善良且有禮貌的紳士。" }," },
        { en: "巨人", cn: "n.", pos: "The giant is as tall as a house.", sen: "巨人住在一座大城堡裡。", trans: "{ en: "Giant", cn: "巨人", pos: "n.", sen: "The giant is as tall as a house.", trans: "巨人住在一座大城堡裡。" }," },
        { en: "女孩", cn: "n.", pos: "The girl has long hair.", sen: "那個女孩穿著一件紅色的洋裝。", trans: "{ en: "Girl", cn: "女孩", pos: "n.", sen: "The girl has long hair.", trans: "那個女孩穿著一件紅色的洋裝。" }," },
        { en: "客人、來賓", cn: "n.", pos: "We have a guest at home today.", sen: "我們有一位客人要來吃晚餐。", trans: "{ en: "Guest", cn: "客人、來賓", pos: "n.", sen: "We have a guest at home today.", trans: "我們有一位客人要來吃晚餐。" }," },
        { en: "傢伙", cn: "n.", pos: "He is a nice guy.", sen: "他是個不錯的傢伙。", trans: "{ en: "Guy", cn: "傢伙", pos: "n.", sen: "He is a nice guy.", trans: "他是個不錯的傢伙。" }," },
        { en: "英雄", cn: "n.", pos: "Spider-Man is my hero.", sen: "消防員是我心目中的英雄。", trans: "{ en: "Hero", cn: "英雄", pos: "n.", sen: "Spider-Man is my hero.", trans: "消防員是我心目中的英雄。" }," },
        { en: "男主(持)人", cn: "n.", pos: "The host says "Welcome!"", sen: "男主人歡迎大家參加聚會。", trans: "{ en: "Host", cn: "男主(持)人", pos: "n.", sen: "The host says "Welcome!"", trans: "男主人歡迎大家參加聚會。" }," },
        { en: "孩童、青年", cn: "n.", pos: "The kid is playing with a ball.", sen: "孩子，別傻了。", trans: "{ en: "Kid", cn: "孩童、青年", pos: "n.", sen: "The kid is playing with a ball.", trans: "孩子，別傻了。" }," },
        { en: "國王", cn: "n.", pos: "The king lives in a big castle.", sen: "國王戴著金色的皇冠。", trans: "{ en: "King", cn: "國王", pos: "n.", sen: "The king lives in a big castle.", trans: "國王戴著金色的皇冠。" }," },
        { en: "淑女、女士", cn: "n.", pos: "She is a beautiful lady.", sen: "各位女士、先生，歡迎！", trans: "{ en: "Lady", cn: "淑女、女士", pos: "n.", sen: "She is a beautiful lady.", trans: "各位女士、先生，歡迎！" }," },
        { en: "男性", cn: "n./adj.", pos: "My dog is a male.", sen: "這隻貓是公的還是母的？", trans: "{ en: "Male", cn: "男性", pos: "n./adj.", sen: "My dog is a male.", trans: "這隻貓是公的還是母的？" }," },
        { en: "男人", cn: "n.", pos: "The man is my father.", sen: "那個男人是一位醫生。", trans: "{ en: "Man", cn: "男人", pos: "n.", sen: "The man is my father.", trans: "那個男人是一位醫生。" }," },
        { en: "主人、大師", cn: "n.", pos: "He is the master of this house.", sen: "他是一位烹飪大師。", trans: "{ en: "Master", cn: "主人、大師", pos: "n.", sen: "He is the master of this house.", trans: "他是一位烹飪大師。" }," },
        { en: "鄰居", cn: "n.", pos: "My neighbor is very kind.", sen: "我的鄰居非常友善。", trans: "{ en: "Neighbor", cn: "鄰居", pos: "n.", sen: "My neighbor is very kind.", trans: "我的鄰居非常友善。" }," },
        { en: "夥伴", cn: "n.", pos: "You are my best partner.", sen: "她是我最好的舞伴。", trans: "{ en: "Partner", cn: "夥伴", pos: "n.", sen: "You are my best partner.", trans: "她是我最好的舞伴。" }," },
        { en: "人們", cn: "n.", pos: "Many people are in the park.", sen: "公園裡有很多人。", trans: "{ en: "People", cn: "人們", pos: "n.", sen: "Many people are in the park.", trans: "公園裡有很多人。" }," },
        { en: "人", cn: "n.", pos: "She is a good person.", sen: "她是一個非常善良的人。", trans: "{ en: "Person", cn: "人", pos: "n.", sen: "She is a good person.", trans: "她是一個非常善良的人。" }," },
        { en: "王子", cn: "n.", pos: "The prince rides a white horse.", sen: "王子住在城堡裡。", trans: "{ en: "Prince", cn: "王子", pos: "n.", sen: "The prince rides a white horse.", trans: "王子住在城堡裡。" }," },
        { en: "公主", cn: "n.", pos: "The princess wears a pink dress.", sen: "公主非常漂亮。", trans: "{ en: "Princess", cn: "公主", pos: "n.", sen: "The princess wears a pink dress.", trans: "公主非常漂亮。" }," },
        { en: "皇后", cn: "n.", pos: "The queen wears a gold crown.", sen: "皇后住在英國。", trans: "{ en: "Queen", cn: "皇后", pos: "n.", sen: "The queen wears a gold crown.", trans: "皇后住在英國。" }," },
        { en: "陌生人", cn: "n.", pos: "Do not talk to a stranger.", sen: "不要跟陌生人說話。", trans: "{ en: "Stranger", cn: "陌生人", pos: "n.", sen: "Do not talk to a stranger.", trans: "不要跟陌生人說話。" }," },
        { en: "青少年", cn: "n.", pos: "My big brother is a teenager.", sen: "我弟弟是個 15 歲的青少年。", trans: "{ en: "Teenager", cn: "青少年", pos: "n.", sen: "My big brother is a teenager.", trans: "我弟弟是個 15 歲的青少年。" }," },
        { en: "訪客", cn: "n.", pos: "The visitor looks at the map.", sen: "博物館裡有很多訪客。", trans: "{ en: "Visitor", cn: "訪客", pos: "n.", sen: "The visitor looks at the map.", trans: "博物館裡有很多訪客。" }," },
        { en: "女人", cn: "n.", pos: "The woman is a teacher.", sen: "那位女人是我的母親。", trans: "{ en: "Woman", cn: "女人", pos: "n.", sen: "The woman is a teacher.", trans: "那位女人是我的母親。" }," },
        { en: "青年", cn: "n.", pos: "He is a healthy youth.", sen: "趁年輕時好好享受青春。", trans: "{ en: "Youth", cn: "青年", pos: "n.", sen: "He is a healthy youth.", trans: "趁年輕時好好享受青春。" }," },
        // ... 其他單字
    ],
    'Level 2：外貌與個性': [
        // ... 其他單字
    ],
    'Level 3：身體部位與器官': [
        // ... 其他單字
    ],
    'Level 4：健康、症狀與醫療': [
        // ... 其他單字
    ],
    'Level 5：家庭成員與家庭': [
        // ... 其他單字
    ],
    'Level 6：稱呼': [
        // ... 其他單字
    ],
    'Level 7：數字': [
        // ... 其他單字
    ],
    
    // 依此類推到 Level 30
    'Level 30：進階主題': [
        // ... 其他單字
    ]
};
