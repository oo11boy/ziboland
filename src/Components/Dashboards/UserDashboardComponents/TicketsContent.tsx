import { TicketsContentProps } from "@/types/types";
import { Add } from "@mui/icons-material";
import { Modal, Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";


export default function TicketsContent({
  supportTickets,
  isTicketModalOpen,
  setIsTicketModalOpen,
  newTicket,
  setNewTicket,
  ticketError,
  setTicketError,
  handleSubmitTicket,
  handleCloseTicket,
  expandedAccordion,
  handleAccordionChange,
  modalStyle,
}: TicketsContentProps) {
  return (
    <div className="ud-animate-slide-in-up">
      <h2 className="ud-main-title">تیکت‌های پشتیبانی</h2>
      <div className="ud-tickets-container">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="ud-tickets-button"
            aria-label="افزودن تیکت جدید"
          >
            <Add className="ud-tickets-button-icon" />
            افزودن تیکت جدید
          </button>
        </div>
        <Modal
          open={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography
              sx={{ fontFamily: "yekannew" }}
              id="modal-modal-title"
              variant="h6"
              component="h2"
              className="ud-modal-title"
            >
              ثبت تیکت جدید
            </Typography>
            <div className="ud-ticket-modal-content">
              <div>
                <label className="ud-ticket-modal-label">موضوع *</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="ud-ticket-modal-input"
                  placeholder="موضوع تیکت را وارد کنید"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label className="ud-ticket-modal-label">متن تیکت *</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="توضیحات تیکت خود را وارد کنید"
                  className="ud-ticket-modal-textarea"
                  rows={6}
                  required
                  aria-required="true"
                />
              </div>
              {ticketError && <p className="ud-ticket-modal-error">{ticketError}</p>}
              <div className="ud-ticket-modal-buttons">
                <button
                  onClick={() => {
                    setIsTicketModalOpen(false);
                    setTicketError("");
                  }}
                  className="ud-ticket-modal-button-cancel"
                  aria-label="لغو ثبت تیکت"
                >
                  لغو
                </button>
                <button
                  onClick={handleSubmitTicket}
                  className="ud-ticket-modal-button-submit"
                  aria-label="ارسال تیکت جدید"
                >
                  ارسال تیکت
                </button>
              </div>
            </div>
          </Box>
        </Modal>
        <div className="ud-tickets-stats">
          {[
            { label: "تیکت باز", count: supportTickets.filter((t) => t.status === "باز").length, color: "ud-ticket-stat-open" },
            { label: "تیکت بسته", count: supportTickets.filter((t) => t.status === "بسته").length, color: "ud-ticket-stat-closed" },
            { label: "پاسخ داده شده", count: supportTickets.filter((t) => t.status === "پاسخ داده شده").length, color: "ud-ticket-stat-responded" },
            { label: "در انتظار", count: supportTickets.filter((t) => t.status === "در انتظار").length, color: "ud-ticket-stat-pending" },
            { label: "همه", count: supportTickets.length, color: "ud-ticket-stat-all" },
          ].map((stat, index) => (
            <div key={index} className={`ud-ticket-stat ${stat.color}`} role="region" aria-label={`آمار ${stat.label}`}>
              <p className="ud-ticket-stat-label">{stat.label}</p>
              <p className="ud-ticket-stat-count">{stat.count.toLocaleString("fa-IR")}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {supportTickets.length === 0 ? (
            <p className="ud-tickets-empty">هیچ تیکتی ثبت نشده است!</p>
          ) : (
            supportTickets.map((ticket) => (
              <Accordion
                key={ticket.id}
                expanded={expandedAccordion === ticket.id}
                onChange={handleAccordionChange(ticket.id)}
                className="ud-ticket-accordion"
              >
                <AccordionSummary
                  expandIcon={<Add className="ud-tickets-button-icon" />}
                  aria-controls={`ticket-panel-${ticket.id}`}
                  id={`ticket-header-${ticket.id}`}
                >
                  <div className="ud-ticket-summary">
                    <Typography sx={{ fontFamily: "yekannew" }} className="ud-ticket-title">
                      {ticket.subject}
                    </Typography>
                    <span
                      className={`ud-ticket-status ${
                        ticket.status === "باز" ? "ud-ticket-status-open" :
                        ticket.status === "بسته" ? "ud-ticket-status-closed" :
                        ticket.status === "پاسخ داده شده" ? "ud-ticket-status-responded" :
                        "ud-ticket-status-pending"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="ud-ticket-details">
                    <p><strong>موضوع:</strong> {ticket.subject}</p>
                    <p><strong>متن تیکت:</strong> {ticket.message}</p>
                    <p><strong>وضعیت:</strong> {ticket.status}</p>
                    <p><strong>تاریخ:</strong> {new Date(ticket.date).toLocaleDateString("fa-IR")}</p>
                    {ticket.response && <p><strong>پاسخ پشتیبانی:</strong> {ticket.response}</p>}
                    <div className="ud-ticket-buttons">
                      {ticket.status !== "بسته" && (
                        <button
                          onClick={() => handleCloseTicket(ticket.id)}
                          className="ud-ticket-button ud-ticket-button-close"
                          aria-label={`بستن تیکت ${ticket.subject}`}
                        >
                          بستن تیکت
                        </button>
                      )}
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </div>
      </div>
    </div>
  );
}