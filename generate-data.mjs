import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取地区数据
const areaData = JSON.parse(
  readFileSync(join(__dirname, 'src', 'area.json'), 'utf-8')
);

// 中文常用字（用于生成社区和门牌号）
const commonChineseChars = '一二三四五六七八九十百千万东南西北中上下左右前后内外新旧大小高低远近';

// 生成随机中文+数字字符串
function generateChineseNumberString(minLength = 2, maxLength = 6) {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let result = '';
  
  for (let i = 0; i < length; i++) {
    if (Math.random() > 0.5) {
      // 添加中文
      result += commonChineseChars[Math.floor(Math.random() * commonChineseChars.length)];
    } else {
      // 添加数字
      result += Math.floor(Math.random() * 10);
    }
  }
  
  return result;
}

// 生成随机姓名
function generateName() {
  const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧', '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕', '苏', '卢', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶', '阎'];
  const givenNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '建华', '文', '华', '红', '建国', '建华', '志强', '秀', '桂', '桂芳', '秀', '秀', '秀', '秀', '秀', '秀'];
  
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
  
  return surname + givenName;
}

// 生成1开头的11位随机手机号
function generatePhone() {
  return '1' + String(Math.floor(Math.random() * 10000000000)).padStart(10, '0');
}

// 随机选择省份和城市
function getRandomProvinceAndCity() {
  const province = areaData[Math.floor(Math.random() * areaData.length)];
  const cities = province.children || [];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  return {
    province: province.value,
    city: city.value
  };
}

// 生成单条数据
function generateUser() {
  const { province, city } = getRandomProvinceAndCity();
  
  return {
    name: generateName(),
    phone: generatePhone(),
    province: province,
    city: city,
    community: generateChineseNumberString(3, 8),
    houseNumber: generateChineseNumberString(2, 6),
    drawCount: 4
  };
}

// CSV转义函数
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }
  return stringValue;
}

// 生成数据并写入CSV
function generateData() {
  const totalRecords = 200000;
  const batchSize = 10000; // 分批处理，避免内存问题
  
  console.log(`开始生成 ${totalRecords} 条数据...`);
  
  // CSV头部
  const headers = ['姓名', '手机号', '省份', '城市', '社区', '门牌号', '抽奖次数'];
  let csvContent = headers.join(',') + '\n';
  
  // 分批生成数据
  for (let batch = 0; batch < totalRecords / batchSize; batch++) {
    const batchData = [];
    
    for (let i = 0; i < batchSize; i++) {
      const user = generateUser();
      batchData.push(user);
    }
    
    // 将批次数据转换为CSV行
    for (const user of batchData) {
      const row = [
        escapeCSV(user.name),
        escapeCSV(user.phone),
        escapeCSV(user.province),
        escapeCSV(user.city),
        escapeCSV(user.community),
        escapeCSV(user.houseNumber),
        escapeCSV(user.drawCount)
      ];
      csvContent += row.join(',') + '\n';
    }
    
    const progress = ((batch + 1) * batchSize / totalRecords * 100).toFixed(1);
    console.log(`已生成 ${(batch + 1) * batchSize} 条数据 (${progress}%)`);
  }
  
  // 写入文件
  const outputPath = join(__dirname, 'users.csv');
  writeFileSync(outputPath, csvContent, 'utf-8');
  
  console.log(`\n数据生成完成！文件已保存到: ${outputPath}`);
  console.log(`总记录数: ${totalRecords}`);
}

// 运行生成函数
generateData();

