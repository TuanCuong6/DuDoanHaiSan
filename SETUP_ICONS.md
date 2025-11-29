# Hướng dẫn sửa lỗi Icon không hiển thị

## Vấn đề
Icon từ react-native-vector-icons không hiển thị (chỉ thấy ô vuông trống)

## Giải pháp

### Bước 1: Đã cấu hình Android ✅
File `android/app/build.gradle` đã được cập nhật tự động.

### Bước 2: Rebuild app Android

Mở terminal và chạy các lệnh sau:

```bash
# Clean build
cd android
gradlew clean
cd ..

# Rebuild app
npx react-native run-android
```

Hoặc đơn giản hơn:

```bash
npx react-native run-android
```

### Bước 3: Nếu vẫn lỗi

Thử xóa cache và rebuild:

```bash
# Xóa cache
npx react-native start --reset-cache

# Trong terminal khác, rebuild
npx react-native run-android
```

### Bước 4: Kiểm tra

Sau khi rebuild xong, icon sẽ hiển thị bình thường.

## Lưu ý

- Bạn PHẢI rebuild app sau khi thêm react-native-vector-icons
- Không thể hot reload được, phải rebuild native code
- Chỉ cần làm 1 lần, sau đó hot reload bình thường

## Nếu vẫn không được

Thử uninstall app cũ trên thiết bị/emulator rồi cài lại:

```bash
# Uninstall
adb uninstall com.tbu

# Cài lại
npx react-native run-android
```
