Topic : Hệ thống quản lý giải đua ngựa
Horse Racing Tournament Management System

Context :
Đua ngựa là một hoạt động thể thao và giải trí có nhiều đối tượng tham gia như chủ ngựa, jockey, trọng tài, ban tổ chức và khán giả. Trong mỗi giải đấu cần quản lý các hoạt động như đăng ký thi đấu, sắp xếp cuộc đua, theo dõi kết quả, bảng xếp hạng và dự đoán kết quả.
Problems:
Việc quản lý giải đua ngựa hiện nay còn thủ công và thiếu đồng bộ, khiến quá trình quản lý thông tin, lịch thi đấu, kết quả và dự đoán mất nhiều thời gian, dễ xảy ra sai sót và gây khó khăn cho cả ban tổ chức lẫn người tham gia.
Primary Actor:
Horse Owner
Jockey
Race Referee
Spectator
Admin

Fuctional Requiredments:
Horse Owner
- Đăng ký tài khoản tham gia hệ thống 
- Đăng ký ngựa tham gia giải đấu 
- Quản lý thông tin ngựa 
- Thuê/chọn jockey cho ngựa tham gia cuộc đua 
- Quản lý danh sách jockey của ngựa, xác nhận jockey tham gia cuộc đua 
- Xem lịch thi đấu của ngựa, xác nhận cho ngựa tham gia cuộc đua 
- Xem thông tin cuộc đua 
- Theo dõi kết quả thi đấu, bảng xếp hạng, tiền thưởng của ngựa 

Jockey
- Đăng ký tài khoản jockey 
- Nhận lời mời điều khiển ngựa từ horse owner 
- Xác nhận hoặc từ chối tham gia cuộc đua 
- Xem danh sách cuộc đua được phân công, thông tin ngựa được điều khiển 
- Theo dõi lịch thi đấu 
- Theo dõi kết quả thi đấu cá nhân, bảng xếp hạng, thành tích cá nhân 

Race Referee
- Kiểm tra thông tin ngựa trước cuộc đua 
- Theo dõi cuộc đua 
- Ghi nhận & xử lý vi phạm 
- Xác nhận kết quả cuộc đua 
- Lập biên bản thi đấu 

Spectator
- Xem thông tin giải, lịch đua 
- Theo dõi kết quả thi đấu trực tiếp, bảng xếp hạng 
- Dự đoán kết quả 
- Theo dõi kết quả dự đoán 
- Nhận thông báo thưởng dự đoán kết quả

Admin
- Quản lý tài khoản người dùng 
- Phân quyền cho các role 
- Quản lý thông tin giải đấu đua ngựa, lập lịch thi đấu, sắp xếp cuộc đua và vòng đua 
- Duyệt đăng ký tham gia 
- Quản lý danh sách ngựa thi đấu, danh sách jockey 
- Phân công trọng tài 
- Công bố kết quả thi đấu 
- Quản lý dự đoán kết quả

Main Entity:
Horse Owner
Jockey
Horse
Tournament
Race
Registration
Race Result
Bet
Prize
Referee Report
