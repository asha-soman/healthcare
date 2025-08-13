const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const Availability = require('../models/availability');
let Appointment; // only used if you added "block delete if booked"
try { Appointment = require('../models/appointment'); } catch (_) {}

const {
  createAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
//   getOpenAvailability,
} = require('../controllers/availabilityController');

describe('Availability Controller', () => {
  afterEach(() => sinon.restore());

  describe('createAvailability', () => {
    it('creates a slot successfully', async () => {
      const userId = new mongoose.Types.ObjectId();
      const req = { user: { _id: userId }, body: { dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' } };
      const created = { _id: new mongoose.Types.ObjectId(), user: userId, ...req.body };

      const createStub = sinon.stub(Availability, 'create').resolves(created);

      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      await createAvailability(req, res);

      expect(createStub.calledOnceWith({ user: userId, ...req.body })).to.equal(true);
      expect(res.status.calledWith(201)).to.equal(true);
      expect(res.json.calledWith(created)).to.equal(true);
    });

    it('400 when missing fields', async () => {
      const req = { user: { _id: new mongoose.Types.ObjectId() }, body: { dayOfWeek: 'Monday', startTime: '' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      await createAvailability(req, res);
      expect(res.status.calledWith(400)).to.equal(true);
    });

    it('400 when startTime >= endTime', async () => {
      const req = { user: { _id: new mongoose.Types.ObjectId() }, body: { dayOfWeek: 'Monday', startTime: '10:00', endTime: '09:00' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      await createAvailability(req, res);
      expect(res.status.calledWith(400)).to.equal(true);
    });

    // it('409 on overlap (if overlap check implemented)', async () => {
    //   // Only passes if you added the overlap logic that checks Availability.find(...)
    //   const userId = new mongoose.Types.ObjectId();
    //   const req = { user: { _id: userId }, body: { dayOfWeek: 'Monday', startTime: '09:30', endTime: '10:30' } };

    //   // Simulate existing slot 09:00-10:00 on Monday for same user
    //   const findStub = sinon.stub(Availability, 'find').resolves([{ startTime: '09:00', endTime: '10:00' }]);
    //   const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    //   await createAvailability(req, res);

    //   // If you didn't add overlap logic, this will fail; remove this test in that case.
    //   expect(findStub.called).to.equal(true);
    //   expect(res.status.calledWith(409)).to.equal(true);
    // });

    it('500 on error', async () => {
      const req = { user: { _id: new mongoose.Types.ObjectId() }, body: { dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00' } };
      sinon.stub(Availability, 'create').throws(new Error('DB Error'));
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
      await createAvailability(req, res);
      expect(res.status.calledWith(500)).to.equal(true);
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.equal(true);
    });
  });

  describe('getMyAvailability', () => {
    it('returns my slots sorted', async () => {
      const userId = new mongoose.Types.ObjectId();
      const slots = [{ dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', user: userId }];
      const sortObj = { sort: sinon.stub().resolves(slots) };
      const findStub = sinon.stub(Availability, 'find').returns(sortObj);

      const req = { user: { _id: userId } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      await getMyAvailability(req, res);

      expect(findStub.calledOnceWith({ user: userId })).to.equal(true);
      expect(sortObj.sort.calledOnce).to.equal(true);
      expect(res.json.calledWith(slots)).to.equal(true);
      expect(res.status.called).to.equal(false);
    });

    it('500 on error', async () => {
      sinon.stub(Availability, 'find').throws(new Error('DB Error'));
      const req = { user: { _id: new mongoose.Types.ObjectId() } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
      await getMyAvailability(req, res);
      expect(res.status.calledWith(500)).to.equal(true);
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.equal(true);
    });
  });

  describe('updateAvailability', () => {
    it('updates my slot successfully', async () => {
      const myId = new mongoose.Types.ObjectId();
      const slotId = new mongoose.Types.ObjectId();
      const slot = {
        _id: slotId,
        user: myId,
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        save: sinon.stub().resolvesThis(),
      };
      sinon.stub(Availability, 'findById').resolves(slot);

      const req = { user: { _id: myId }, params: { id: slotId }, body: { startTime: '09:30', endTime: '10:30' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      await updateAvailability(req, res);

      expect(slot.startTime).to.equal('09:30');
      expect(slot.endTime).to.equal('10:30');
      expect(slot.save.calledOnce).to.equal(true);
      expect(res.json.calledOnce).to.equal(true);
    });

    it('404 when slot not found', async () => {
      sinon.stub(Availability, 'findById').resolves(null);
      const req = { user: { _id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() }, body: {} };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
      await updateAvailability(req, res);
      expect(res.status.calledWith(404)).to.equal(true);
    });

    it('403 when not owner', async () => {
      const slot = { _id: new mongoose.Types.ObjectId(), user: new mongoose.Types.ObjectId() };
      sinon.stub(Availability, 'findById').resolves(slot);
      const req = { user: { _id: new mongoose.Types.ObjectId() }, params: { id: slot._id }, body: {} };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
      await updateAvailability(req, res);
      expect(res.status.calledWith(403)).to.equal(true);
    });

    it('400 when invalid time range', async () => {
      const myId = new mongoose.Types.ObjectId();
      const slot = { _id: new mongoose.Types.ObjectId(), user: myId };
      sinon.stub(Availability, 'findById').resolves(slot);
      const req = { user: { _id: myId }, params: { id: slot._id }, body: { startTime: '11:00', endTime: '10:00' } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
      await updateAvailability(req, res);
      expect(res.status.calledWith(400)).to.equal(true);
    });

    it('500 on error', async () => {
      sinon.stub(Availability, 'findById').throws(new Error('DB Error'));
      const req = { user: { _id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() }, body: {} };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
      await updateAvailability(req, res);
      expect(res.status.calledWith(500)).to.equal(true);
    });
  });

  describe('deleteAvailability', () => {
    it('deletes my slot', async () => {
      const myId = new mongoose.Types.ObjectId();
      const slot = { _id: new mongoose.Types.ObjectId(), user: myId, deleteOne: sinon.stub().resolves() };
      sinon.stub(Availability, 'findById').resolves(slot);
      const req = { user: { _id: myId }, params: { id: slot._id } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
      await deleteAvailability(req, res);
      expect(slot.deleteOne.calledOnce).to.equal(true);
      expect(res.json.calledWithMatch({ message: sinon.match.string })).to.equal(true);
    });

    it('404 when not found', async () => {
      sinon.stub(Availability, 'findById').resolves(null);
      const req = { user: { _id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
      await deleteAvailability(req, res);
      expect(res.status.calledWith(404)).to.equal(true);
    });

    it('403 when not owner', async () => {
      const slot = { _id: new mongoose.Types.ObjectId(), user: new mongoose.Types.ObjectId() };
      sinon.stub(Availability, 'findById').resolves(slot);
      const req = { user: { _id: new mongoose.Types.ObjectId() }, params: { id: slot._id } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
      await deleteAvailability(req, res);
      expect(res.status.calledWith(403)).to.equal(true);
    });

    it('500 on error', async () => {
      sinon.stub(Availability, 'findById').throws(new Error('DB Error'));
      const req = { user: { _id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
      await deleteAvailability(req, res);
      expect(res.status.calledWith(500)).to.equal(true);
    });

    it('400 when active appointment exists (if you added that check)', async () => {
      if (!Appointment) return; // skip if model not present
      const myId = new mongoose.Types.ObjectId();
      const slot = { _id: new mongoose.Types.ObjectId(), user: myId, deleteOne: sinon.stub() };
      sinon.stub(Availability, 'findById').resolves(slot);
      sinon.stub(Appointment, 'findOne').resolves({ _id: new mongoose.Types.ObjectId(), status: 'booked' });

      const req = { user: { _id: myId }, params: { id: slot._id } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
      await deleteAvailability(req, res);
      expect(res.status.calledWith(400)).to.equal(true);
    });
  });

//   describe('getOpenAvailability', () => {
//     it('lists open availability with filters and population', async () => {
//       const slots = [{ _id: new mongoose.Types.ObjectId(), dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', user: { _id: new mongoose.Types.ObjectId(), name: 'Dr A' } }];
//       const populateChain = { populate: sinon.stub().resolves(slots) };
//       const sortChain = { sort: sinon.stub().returns(populateChain) };
//       const findStub = sinon.stub(Availability, 'find').returns(sortChain);

//       const req = { query: { doctorId: 'abc', dayOfWeek: 'Monday' } };
//       const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

//       await getOpenAvailability(req, res);

//       expect(findStub.calledOnce).to.equal(true);
//       expect(sortChain.sort.calledOnce).to.equal(true);
//       expect(res.json.calledWith(slots)).to.equal(true);
//     });

//     it('500 on error', async () => {
//       sinon.stub(Availability, 'find').throws(new Error('DB Error'));
//       const req = { query: {} };
//       const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };
//       await getOpenAvailability(req, res);
//       expect(res.status.calledWith(500)).to.equal(true);
//     });
//   });
});
