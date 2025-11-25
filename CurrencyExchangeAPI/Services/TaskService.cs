using CurrencyExchangeAPI.Models;

namespace CurrencyExchangeAPI.Services
{
    public interface ITaskService
    {
        List<UserStoryTask> GetAllTasks();
        UserStoryTask? GetTaskById(int id);
    }

    public class TaskService : ITaskService
    {
        private readonly List<UserStoryTask> _tasks;

        public TaskService()
        {
            _tasks = new List<UserStoryTask>
            {
                new UserStoryTask
                {
                    Id = 1,
                    Title = "111",
                    Description = "2222",
                    ParentTaskId = null,
                    CreatedAt = DateTime.UtcNow
                }
            };
        }

        public List<UserStoryTask> GetAllTasks()
        {
            return new List<UserStoryTask>(_tasks);
        }

        public UserStoryTask? GetTaskById(int id)
        {
            return _tasks.FirstOrDefault(t => t.Id == id);
        }
    }
}
